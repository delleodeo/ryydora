import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api, getApiError } from '../services/api.js';
import { getSocket } from '../services/socket.js';

export const useBookingStore = defineStore('booking', () => {
  const pickup = ref(null);
  const dropoff = ref(null);
  const passengerCount = ref(1);
  const rideType = ref('shared');
  const current = ref(null);
  const history = ref([]);
  const estimates = ref({});
  const nearbyDrivers = ref([]);
  const loading = ref(false);
  const error = ref(null);
  let socketBound = false;

  const canEstimate = computed(() => Boolean(pickup.value && dropoff.value));

  function setLocation(kind, location) {
    if (kind === 'pickup') pickup.value = location;
    else dropoff.value = location;
  }

  async function estimate(type) {
    if (!canEstimate.value) return null;
    const response = await api.post('/bookings/estimate', {
      pickupLocation: pickup.value,
      dropoffLocation: dropoff.value,
      passengerCount: passengerCount.value,
      rideType: type,
    });
    estimates.value[type] = response.data.data;
    return estimates.value[type];
  }

  async function loadNearbyDrivers(location = pickup.value) {
    if (!location?.coordinates) {
      nearbyDrivers.value = [];
      return nearbyDrivers.value;
    }
    const [longitude, latitude] = location.coordinates;
    const response = await api.get('/drivers/nearby', {
      params: { longitude, latitude },
    });
    nearbyDrivers.value = response.data.data.drivers;
    return nearbyDrivers.value;
  }

  async function create(type) {
    loading.value = true;
    error.value = null;
    try {
      rideType.value = type;
      const response = await api.post(
        '/bookings',
        {
          pickupLocation: pickup.value,
          dropoffLocation: dropoff.value,
          passengerCount: passengerCount.value,
          rideType: type,
        },
        { headers: { 'idempotency-key': crypto.randomUUID() } },
      );
      current.value = response.data.data.booking;
      bindSocket();
      return current.value;
    } catch (caught) {
      error.value = getApiError(caught, 'Unable to create your booking.');
      throw caught;
    } finally {
      loading.value = false;
    }
  }

  async function load(id) {
    const response = await api.get(`/bookings/${id}`);
    current.value = response.data.data.booking;
    bindSocket();
    return current.value;
  }

  async function loadHistory() {
    const response = await api.get('/bookings/my');
    history.value = response.data.data;
    current.value = history.value.find((item) =>
      ['searching', 'accepted', 'driver_arriving', 'picked_up'].includes(item.status),
    );
    return history.value;
  }

  async function cancel(reason) {
    const response = await api.post(`/bookings/${current.value._id}/cancel`, { reason });
    current.value = response.data.data.booking;
    return current.value;
  }

  function bindSocket() {
    if (socketBound) return;
    const socket = getSocket();
    const update = (payload) => {
      if (current.value && payload.bookingId === current.value._id) load(current.value._id);
    };
    socket.on('booking:accepted', update);
    socket.on('booking:status_changed', update);
    socket.on('driver:location_updated', (payload) => {
      if (current.value?.assignedDriverId) {
        current.value.assignedDriverId.currentLocation = {
          type: 'Point',
          coordinates: payload.coordinates,
        };
      }
    });
    socketBound = true;
  }

  function resetDraft() {
    pickup.value = null;
    dropoff.value = null;
    passengerCount.value = 1;
    rideType.value = 'shared';
    estimates.value = {};
    nearbyDrivers.value = [];
  }

  return {
    pickup,
    dropoff,
    passengerCount,
    rideType,
    current,
    history,
    estimates,
    nearbyDrivers,
    loading,
    error,
    canEstimate,
    setLocation,
    estimate,
    loadNearbyDrivers,
    create,
    load,
    loadHistory,
    cancel,
    bindSocket,
    resetDraft,
  };
});

