/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

 /*
    Dependencies
*/
import { precacheAndRoute } from 'workbox-precaching';


/*
  Config
*/
precacheAndRoute(self.__WB_MANIFEST);


console.log('custom-service-worker.js being used');
