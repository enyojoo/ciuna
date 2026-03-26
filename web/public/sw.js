/**
 * Minimal service worker for PWA installability (Chrome) and update flow.
 *
 * Intentionally NO "fetch" handler: a passthrough `fetch(event.request)` for all
 * requests broke navigations and Supabase auth (FetchEvent network error,
 * "Failed to fetch" in sw.js). The default browser network stack is used instead.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})
