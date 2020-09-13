<template>
  <transition
    appear
    enter-active-class="animated slideInUp"
    leave-active-class="animated slideOutDown"
  >
    <div v-if="showAppInstallBanner" class="bg-primary">
      <div class="constrain">
        <q-banner
          class="bg-primary text-white"
          dense
          inline-actions
        >
          <template v-slot:avatar>
            <q-avatar
              color="white"
              font-size="22px"
              icon="eva-camera-outline"
              text-color="grey-10"
            />
          </template>

          Install Quasargram?

          <template v-slot:action>
            <!-- Yes (install app) -->
            <q-btn
              @click="installApp"
              label="Yes"
              dense
              flat
              class="q-px-sm"
            />

            <!-- Later (defer app installation) -->
            <q-btn
              @click="showAppInstallBanner = false"
              label="Later"
              dense
              flat
              class="q-px-sm"
            />

            <!-- Never (never prompt app installation) -->
            <q-btn
              @click="neverShowAppInstallbanner"
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
let deferredPrompt;

export default {
  data() {
    return {
      showAppInstallBanner: false
    }
  },

  methods:{
    installApp() {
      // https://web.dev/customize-install/
      // Hide the app provided install promotion
      this.showAppInstallBanner = false;

      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');

          this.neverShowAppInstallbanner();
        }
        else {
          console.log('User dismissed the install prompt');
        }
      });
    },

    neverShowAppInstallbanner() {
      this.showAppInstallBanner = false;

      // Save user's intent to never install app
      this.$q.localStorage.set('neverShowAppInstallBanner', true);
    }
  },

  mounted() {
    // Has user clicked 'Never' for app install?
    let neverShowAppInstallBanner = this.$q.localStorage.getItem('neverShowAppInstallBanner');

    if (!neverShowAppInstallBanner) {
      // https://web.dev/customize-install/
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();

        // Stash the event so it can be triggered later.
        deferredPrompt = e;

        setTimeout(() => {
          // Update UI notify the user they can install the PWA
          this.showAppInstallBanner = true;
        }, 3000);
      });
    }
  }
}
</script>
