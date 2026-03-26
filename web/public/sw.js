/**
 * Minimal service worker for PWA installability (Chrome) and safe updates.
 * Network-only: no offline caching of app routes.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

// Do not register a fetch handler: intercepting all requests can break auth/cookie behavior
// and navigations; network requests stay on the default path (no SW interception).
