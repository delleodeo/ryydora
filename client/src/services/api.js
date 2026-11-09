import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const refreshClient = axios.create({ baseURL, withCredentials: true, timeout: 15_000 });

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

function readCookie(name) {
  const item = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${encodeURIComponent(name)}=`));
  return item ? decodeURIComponent(item.split('=').slice(1).join('=')) : null;
}

export async function ensureCsrfToken() {
  const existing = readCookie('rydora_csrf');
  if (existing) return existing;
  const response = await refreshClient.get('/auth/csrf');
  return response.data.data.csrfToken;
}

api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase();
  if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    config.headers['x-csrf-token'] = await ensureCsrfToken();
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = original?.url?.includes('/auth/login') || original?.url?.includes('/auth/register');
    if (error.response?.status !== 401 || original?._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }
    original._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = ensureCsrfToken().then((token) =>
          refreshClient.post('/auth/refresh', null, { headers: { 'x-csrf-token': token } }),
        );
      }
      await refreshPromise;
      return api(original);
    } catch (refreshError) {
      window.dispatchEvent(new CustomEvent('rydora:session-expired'));
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  },
);

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  return {
    message: error.response?.data?.message || fallback,
    code: error.response?.data?.code,
    details: error.response?.data?.details,
  };
}

