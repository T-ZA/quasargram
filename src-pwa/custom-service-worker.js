/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

 /*
    Dependencies
*/
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';


/*
  Config
*/
precacheAndRoute(self.__WB_MANIFEST);


console.log('custom-service-worker.js being used');


/*
  Caching Strategies
*/

// Cache-first strategy
// (good for unchanging resources, e.g. font files)
registerRoute(
  // Google fonts paths that should be cached
  new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),

  // actual strategy used
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
    ],
  })
);

// Network-first strategy
// (good for content that always needs to be up-to-date)
registerRoute(
  ({url}) => url.pathname.startsWith('/posts'),
  new NetworkFirst()
);

// Stale-while-revalidate strategy as the default
// (look to cache first and then update from network in the background)
registerRoute(
  // paths that will use this strategy
  ({ url }) => url.href.startsWith('http'),

  // actual strategy used
  new StaleWhileRevalidate()
);
