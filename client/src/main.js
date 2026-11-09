import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { registerSW } from 'virtual:pwa-register';
import 'leaflet/dist/leaflet.css';
import './styles/tokens.css';
import './styles/base.css';
import App from './App.vue';
import router from './router/index.js';

registerSW({ immediate: true });

createApp(App).use(createPinia()).use(router).mount('#app');

