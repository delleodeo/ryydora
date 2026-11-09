import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const routes = [
  {
    path: '/',
    component: () => import('../layouts/AuthLayout.vue'),
    children: [
      { path: '', redirect: '/welcome' },
      { path: 'welcome', name: 'welcome', component: () => import('../modules/auth/WelcomeView.vue'), meta: { guest: true } },
      { path: 'login', name: 'login', component: () => import('../modules/auth/LoginView.vue'), meta: { guest: true } },
      { path: 'register', name: 'register', component: () => import('../modules/auth/RegisterView.vue'), meta: { guest: true } },
    ],
  },
  {
    path: '/app',
    component: () => import('../layouts/CommuterLayout.vue'),
    meta: { requiresAuth: true, roles: ['commuter'] },
    children: [
      { path: '', redirect: '/app/home' },
      { path: 'home', name: 'commuter-home', component: () => import('../modules/commuter/CommuterHomeView.vue') },
      { path: 'pickup', name: 'pickup', component: () => import('../modules/commuter/LocationPickerView.vue'), props: { mode: 'pickup' } },
      { path: 'dropoff', name: 'dropoff', component: () => import('../modules/commuter/LocationPickerView.vue'), props: { mode: 'dropoff' } },
      { path: 'ride-options', name: 'ride-options', component: () => import('../modules/commuter/RideOptionsView.vue') },
      { path: 'available-tricycles', name: 'available-tricycles', component: () => import('../modules/commuter/AvailableTricyclesView.vue') },
      { path: 'booking/:id', name: 'booking-status', component: () => import('../modules/commuter/BookingStatusView.vue') },
      { path: 'history', name: 'commuter-history', component: () => import('../modules/commuter/BookingHistoryView.vue') },
      { path: 'wallet', name: 'commuter-wallet', component: () => import('../modules/commuter/WalletView.vue') },
      { path: 'notifications', name: 'notifications', component: () => import('../modules/common/NotificationsView.vue') },
      { path: 'profile', name: 'commuter-profile', component: () => import('../modules/common/ProfileView.vue') },
    ],
  },
  {
    path: '/driver',
    component: () => import('../layouts/DriverLayout.vue'),
    meta: { requiresAuth: true, roles: ['driver'] },
    children: [
      { path: '', redirect: '/driver/home' },
      { path: 'home', name: 'driver-home', component: () => import('../modules/driver/DriverHomeView.vue') },
      { path: 'booking/:id', name: 'driver-booking', component: () => import('../modules/driver/DriverBookingView.vue') },
      { path: 'history', name: 'driver-history', component: () => import('../modules/driver/DriverHistoryView.vue') },
      { path: 'earnings', name: 'driver-earnings', component: () => import('../modules/driver/DriverEarningsView.vue') },
      { path: 'profile', name: 'driver-profile', component: () => import('../modules/common/ProfileView.vue') },
    ],
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('../modules/admin/AdminDashboardView.vue') },
      { path: 'users', name: 'admin-users', component: () => import('../modules/admin/AdminUsersView.vue') },
      { path: 'drivers', name: 'admin-drivers', component: () => import('../modules/admin/AdminDriversView.vue') },
      { path: 'bookings', name: 'admin-bookings', component: () => import('../modules/admin/AdminBookingsView.vue') },
      { path: 'fares', name: 'admin-fares', component: () => import('../modules/admin/AdminFaresView.vue') },
      { path: 'reports', name: 'admin-reports', component: () => import('../modules/admin/AdminReportsView.vue') },
      { path: 'profile', name: 'admin-profile', component: () => import('../modules/common/ProfileView.vue') },
    ],
  },
  { path: '/forbidden', name: 'forbidden', component: () => import('../modules/common/ForbiddenView.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../modules/common/NotFoundView.vue') },
];

const router = createRouter({ history: createWebHistory(), routes, scrollBehavior: () => ({ top: 0 }) });

function roleHome(role) {
  return role === 'admin' ? '/admin' : role === 'driver' ? '/driver/home' : '/app/home';
}

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.initialize();
  const requiresAuth = to.matched.some((route) => route.meta.requiresAuth);
  const allowedRoles = to.matched.flatMap((route) => route.meta.roles ?? []);
  if (requiresAuth && !auth.isAuthenticated) return { name: 'login', query: { redirect: to.fullPath } };
  if (allowedRoles.length && !allowedRoles.includes(auth.role)) return { name: 'forbidden' };
  if (to.meta.guest && auth.isAuthenticated) return roleHome(auth.role);
  return true;
});

export default router;

