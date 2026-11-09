<script setup>
import { LocateFixed } from '@lucide/vue';
import L from 'leaflet';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  center: { type: Array, default: () => [13.1734, 121.2788] },
  zoom: { type: Number, default: 14 },
  markers: { type: Array, default: () => [] },
  routeGeometry: { type: Object, default: null },
  routeColor: { type: String, default: '#059669' },
  interactive: { type: Boolean, default: true },
  height: { type: String, default: '100%' },
  recenterPosition: { type: String, default: 'top-right' },
});
const emit = defineEmits(['map-click', 'marker-click']);
const mapElement = ref();
let map;
let markerLayer;
let routeLayer;

const markerColors = {
  current: '#2563eb',
  pickup: '#059669',
  dropoff: '#ef4444',
  available: '#10b981',
  roadside: '#f97316',
  driver: '#2563eb',
  assigned: '#f59e0b',
};

function markerIcon(type) {
  if (type === 'tricycle') {
    return L.divIcon({
      className: 'rydora-tricycle-wrap',
      html: '<span class="rydora-tricycle-marker" aria-hidden="true">🛺</span>',
      iconSize: [38, 44],
      iconAnchor: [19, 40],
    });
  }
  const color = markerColors[type] || markerColors.available;
  return L.divIcon({
    className: 'rydora-marker-wrap',
    html: `<span class="rydora-marker" style="--marker-color:${color}"><i></i></span>`,
    iconSize: [34, 42],
    iconAnchor: [17, 39],
  });
}

function renderMarkers() {
  if (!map || !markerLayer) return;
  markerLayer.clearLayers();
  for (const item of props.markers) {
    if (!Array.isArray(item.position) || item.position.length !== 2) continue;
    const marker = L.marker(item.position, { icon: markerIcon(item.type), keyboard: true });
    if (item.label) {
      const label = document.createElement('span');
      label.textContent = item.label;
      marker.bindTooltip(label, {
        direction: item.tooltipDirection || 'top',
        offset: [0, -28],
        permanent: Boolean(item.permanentLabel),
        opacity: 1,
        className: item.tooltipClass || '',
      });
    }
    marker.on('click', () => emit('marker-click', item));
    marker.addTo(markerLayer);
  }
}

function renderRoute() {
  if (routeLayer) {
    routeLayer.remove();
    routeLayer = null;
  }
  const coordinates = props.routeGeometry?.coordinates;
  if (!map || !Array.isArray(coordinates)) return;
  const latLngs = coordinates.map(([longitude, latitude]) => [latitude, longitude]);
  routeLayer = L.polyline(latLngs, {
    color: props.routeColor,
    weight: 5,
    opacity: 0.9,
    lineCap: 'round',
    lineJoin: 'round',
  }).addTo(map);
  if (latLngs.length > 1) map.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });
}

function recenter() {
  map?.flyTo(props.center, props.zoom, { duration: 0.6 });
}

onMounted(async () => {
  await nextTick();
  map = L.map(mapElement.value, {
    zoomControl: false,
    attributionControl: true,
    dragging: props.interactive,
    touchZoom: props.interactive,
    scrollWheelZoom: props.interactive,
    doubleClickZoom: props.interactive,
  }).setView(props.center, props.zoom);
  L.tileLayer(
    import.meta.env.VITE_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution: import.meta.env.VITE_TILE_ATTRIBUTION || '&copy; OpenStreetMap contributors',
    },
  ).addTo(map);
  if (props.interactive) L.control.zoom({ position: 'bottomright' }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
  if (props.interactive) {
    map.on('click', ({ latlng }) => emit('map-click', [latlng.lat, latlng.lng]));
  }
  renderMarkers();
  renderRoute();
  window.setTimeout(() => map?.invalidateSize(), 50);
});

watch(() => props.markers, renderMarkers, { deep: true });
watch(() => props.routeGeometry, renderRoute, { deep: true });
watch(() => props.center, recenter, { deep: true });

onBeforeUnmount(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <div class="map-shell" :style="{ height }">
    <div ref="mapElement" class="map" aria-label="Interactive map of Victoria, Oriental Mindoro"></div>
    <button
      v-if="recenterPosition !== 'hidden'"
      class="recenter"
      :class="recenterPosition"
      type="button"
      aria-label="Recenter map"
      @click="recenter"
    >
      <LocateFixed :size="20" />
    </button>
  </div>
</template>

<style scoped>
.map-shell { position: relative; min-height: 260px; overflow: hidden; background: #dbeafe; }
.map { width: 100%; height: 100%; min-height: inherit; }
.recenter { position: absolute; z-index: 500; top: 14px; right: 14px; display: grid; width: 43px; height: 43px; place-items: center; border: 1px solid rgb(226 232 240 / 0.9); border-radius: 13px; background: white; box-shadow: var(--shadow-md); color: var(--color-primary-dark); }
.recenter.bottom-right { top: auto; bottom: 18px; border-radius: 50%; }
:global(.rydora-marker-wrap) { background: none; border: 0; }
:global(.rydora-marker) { position: relative; display: grid; width: 32px; height: 32px; place-items: center; border: 4px solid white; border-radius: 50% 50% 50% 10%; transform: rotate(-45deg); background: var(--marker-color); box-shadow: 0 6px 14px rgb(15 23 42 / 0.24); }
:global(.rydora-marker i) { width: 8px; height: 8px; border-radius: 50%; transform: rotate(45deg); background: white; }
:global(.rydora-tricycle-wrap) { background: none; border: 0; }
:global(.rydora-tricycle-marker) { display: grid; width: 38px; height: 38px; place-items: center; border: 3px solid white; border-radius: 12px 12px 12px 4px; background: #047857; box-shadow: 0 6px 15px rgb(15 23 42 / 0.3); font-size: 21px; line-height: 1; }
:global(.waiting-commuter-tooltip) { max-width: 190px; padding: 7px 9px; border: 1px solid #a7f3d0; border-radius: 9px; background: rgb(255 255 255 / 0.96); box-shadow: 0 5px 14px rgb(15 23 42 / 0.15); color: #064e3b; font-size: 11px; font-weight: 700; line-height: 1.3; white-space: normal; }
:global(.leaflet-control-attribution) { font-size: 9px; }
</style>

