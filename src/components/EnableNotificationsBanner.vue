<template>
  <transition
    appear
    enter-active-class="animated slideInDown"
    leave-active-class="animated slideOutUp"
  >
    <div
      v-if="showEnableNotificationsBanner && pushNotificationsSupported"
      class="bg-primary"
    >
      <div class="constrain">
        <q-banner class="bg-grey-3 q-mb-md">
          <template v-slot:avatar>
            <q-icon
              color="primary"
              name="eva-bell-outline"
              :size="$q.platform.is.mobile ? '24px' : '37px'"
            />
          </template>

          Enable notifications?

          <template v-slot:action>
            <!-- Yes (install app) -->
            <q-btn
              @click="enableNotifications"
              color="primary"
              label="Yes"
              dense
              flat
              class="q-px-sm"
            />

            <!-- Later (defer app installation) -->
            <q-btn
              @click="showEnableNotificationsBanner = false"
              color="primary"
              label="Later"
              dense
              flat
              class="q-px-sm"
            />

            <!-- Never (never prompt app installation) -->
            <q-btn
              @click="neverShowEnableNotificationsBanner"
              color="primary"
              label="Never"
              dense
              flat
              class="q-px-sm"
            />
          </template>
        </q-banner>
      </div>
    </div>
  </transition>
</template>

<script>
let qs = require('qs');

export default {
  data() {
    return {
      showEnableNotificationsBanner: false,
    }
  },

  computed: {
    serviceWorkerSupported() {
      if ('serviceWorker' in navigator) return true;
      return false;
    },

    pushNotificationsSupported() {
      // 'PushManager' is for push notifications support
      // 'Notifications' is for regular notifications support
      if ('PushManager' in window) return true;
      return false;
    }
  },

  methods: {
    initEnableNotificationsBanner() {
      // Has user clicked 'Never' for enable notifications?
      let neverShowEnableNotificationsBanner = this.$q.localStorage.getItem('neverShowEnableNotificationsBanner');

      if (!neverShowEnableNotificationsBanner) {
        // Update UI notify the user they can choose to receive notifications
        this.showEnableNotificationsBanner = true;
      }
    },

    enableNotifications() {
      if (this.pushNotificationsSupported) {
        // User Notification API to ask user for notification access
        Notification.requestPermission((result) => {
          console.log('Notifications permission result: ', result);

          this.neverShowEnableNotificationsBanner();

          if (result == 'granted') {
            this.checkForExistingPushSubscription();
          }
        });
      }
    },

    checkForExistingPushSubscription() {
      if (this.serviceWorkerSupported && this.pushNotificationsSupported) {
        let subRegistration;

        // Once the service worker is ready
        navigator.serviceWorker.ready
          // Get the current subscription for the browser's push subscription server
          .then((swReg) => {
            // Store service worker response for later use
            subRegistration = swReg;

            return swReg.pushManager.getSubscription();
          })

          // Then proceed based on if there's an existing subscription or not
          .then((subscription) => {
            if (!subscription) {
              this.createPushSubscription(subRegistration);
            }
          });
      }
    },

    createPushSubscription(subRegistration) {
      let vapidPublicKey = 'BBcgM9CoP8lTIawFSU5c0ZlowZp_X_Be6BTxFH40jg3WxIo7KyUJEalxqGqSLzIbYcZM4p1QKaUvWQfd2EaTeTk';
      let convertedVapidPublicKey = this.urlBase64ToUint8Array(vapidPublicKey);

      // Setup subscription to browser push server
      subRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidPublicKey
      })
      .then((newSub) => {
        let newSubJSON = newSub.toJSON();
        let newSubQS = qs.stringify(newSubJSON);

        this.$axios.post(`${process.env.QUASARGRAM_BACKEND_API}/createSubscription?${newSubQS}`);
      })
      .then((response) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/notification
        let notificationOptions = {
          body: 'Thanks for subscribing!',
          icon: 'icons/icon-128x128.png',
          image: 'icons/icon-128x128.png',
          badge: 'icons/icon-128x128.png',
          dir: 'ltr',
          lang: 'en-US',
          vibrate: [],
          tag: 'user-subscribed-notification',
          actions: [
            {
              action: 'hello',
              title: 'Hello',
              icon: 'icons/icon-128x128.png'
            },
            {
              action: 'goodbye',
              title: 'Goodbye',
              icon: 'icons/icon-128x128.png'
            }
          ]
        }

        this.displayNotification('You\'re subscribed to notifications!', notificationOptions);
      })
      .catch((error) => console.error(error.message));
    },

    // https://github.com/web-push-libs/web-push
    urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    },

    neverShowEnableNotificationsBanner() {
      this.showEnableNotificationsBanner = false;

      // Save user's intent to never receive notifications
      this.$q.localStorage.set('neverShowEnableNotificationsBanner', true);
    },

    displayNotification(message, options) {
      // After checking for service worker & push notifications support,
      // get the service worker once it is ready and use it to display a notification
      if (this.serviceWorkerSupported && this.pushNotificationsSupported) {
        navigator.serviceWorker.ready.then((swReg) => {
          swReg.showNotification(message, options);
        })
      }
    }
  },

  mounted() {
    this.initEnableNotificationsBanner();
  }
}
</script>
