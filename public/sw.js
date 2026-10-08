// CMCart Service Worker for PWA
const CACHE_NAME = 'cmcart-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let browser handle normal navigation and cache
  if (event.request.method !== 'GET') return;
});
