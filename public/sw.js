import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  getCacheKeyForURL,
} from "workbox-precaching";
import { skipWaiting, clientsClaim } from "workbox-core";
import { registerRoute } from "workbox-routing";

precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

skipWaiting();

clientsClaim();

// Cache images
registerRoute(
  /\.(?:png|gif|jpg|jpeg|webp|svg)$/,
  new workbox.strategies.CacheFirst({
    cacheName: "images",
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      }),
    ],
  }),
);

// Offline fallback app shell
registerRoute(
  ({ event }) => event.request.mode === "navigate",
  ({ url }) =>
    fetch(url.href).catch(() => caches.match(getCacheKeyForURL("/index.html"))),
);
