import { ref } from 'vue';

const VICTORIA_CENTER = [13.1734, 121.2788];

export function useGeolocation() {
  const coordinates = ref(null);
  const loading = ref(false);
  const error = ref(null);

  function requestLocation(options = {}) {
    loading.value = true;
    error.value = null;
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        error.value = 'Geolocation is not supported on this device.';
        loading.value = false;
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          coordinates.value = [position.coords.latitude, position.coords.longitude];
          loading.value = false;
          resolve(coordinates.value);
        },
        (caught) => {
          error.value =
            caught.code === caught.PERMISSION_DENIED
              ? 'Location permission was denied. Select a point on the map instead.'
              : 'Your location could not be determined. Select a point on the map.';
          loading.value = false;
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000, ...options },
      );
    });
  }

  return { coordinates, loading, error, fallback: VICTORIA_CENTER, requestLocation };
}

