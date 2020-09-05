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
import { Queue } from 'workbox-background-sync';


/*
  Config
*/
precacheAndRoute(self.__WB_MANIFEST);

// Determine browser background sync support
let backgroundSyncSupported = 'sync' in self.registration ? true : false;

/*
  Queue - Create Post
*/
let createPostQueue = null;
if (backgroundSyncSupported) {
  createPostQueue = new Queue(
    // Queue name
    'createPostQueue',

    // Options for queue
    {
      // onSync function to execute whenever the 'sync' event fires
      // (in terms of this app, when Internet is available again)
      // https://github.com/GoogleChrome/workbox/issues/2044#issuecomment-486390207
      onSync: async ({ queue }) => {
        let entry;
        // While there are still entries
        while (entry = await queue.shiftRequest()) {
          try {
            // Attempt to retry the requewst on the queue
            await fetch(entry.request);

            console.log('Replay successful for request', entry.request);

            // Use BroadcastChannel API in modern browsers to
            // send a message once the post is successfully posted
            // https://stackoverflow.com/questions/42127148/service-worker-communicate-to-clients
            const channel = new BroadcastChannel('sw-messages');
            channel.postMessage({msg: 'offline-post-uploaded'});
          } catch (error) {
            console.error('Replay failed for request', entry.request, error);

            // Put the entry back in the queue and re-throw the error:
            await queue.unshiftRequest(entry);
            throw error;
          }
        }
        console.log('Replay complete!');
      }
    }
  );
}


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


/*
  Events - Fetch
*/
if (backgroundSyncSupported) {
  self.addEventListener('fetch', (event) => {
    // Determine the URL of the fetch request prior to acting on
    // adding the request to a background sync queue
    if (event.request.url.endsWith('/createPost')) {
      // Clone the request to ensure it's safe to read when
      // adding to the Queue.
      const promiseChain =
        fetch(event.request.clone())
        .catch((err) => {
          return createPostQueue.pushRequest({request: event.request});
        });

      event.waitUntil(promiseChain);
    }
  });
}
