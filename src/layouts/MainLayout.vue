<template>
  <q-layout view="lHh Lpr lFf">
    <!-- App Header (desktop navigation) -->
    <q-header
      class="bg-white text-grey-10"
      bordered
    >
      <q-toolbar class="constrain">
        <q-btn
          class="large-screen-only q-mr-xs"
          icon="eva-camera-outline"
          size="18px"
          dense
          flat
          round
          to="/camera"
        />

        <q-separator
          class="large-screen-only"
          spaced
          vertical
        />

        <q-toolbar-title class="text-grand-hotel text-bold">
          Quasargram
        </q-toolbar-title>

        <q-btn
          class="large-screen-only"
          icon="eva-home-outline"
          size="18px"
          dense
          flat
          round
          to="/"
        />
      </q-toolbar>
    </q-header>

    <!-- App Footer -->
    <q-footer
      class="bg-white"
      bordered
    >
      <install-app-banner v-if="showAppInstallBanner" />

      <!-- Mobile Navigation tabs -->
      <q-tabs
        class="text-grey-10 small-screen-only"
        active-color="primary"
        indicator-color="transparent"
      >
        <q-route-tab
          icon="eva-home-outline"
          to="/"
        />
        <q-route-tab
          icon="eva-camera-outline"
          to="/camera"
        />
      </q-tabs>
    </q-footer>

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
let deferredPrompt;

export default {
  name: 'MainLayout',
  components: {
    'install-app-banner': () => import('src/components/InstallAppBanner.vue')
  },
  data () {
    return {
      showAppInstallBanner: false
    }
  },
  mounted() {
    // https://web.dev/customize-install/
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Stash the event so it can be triggered later.
      deferredPrompt = e;

      // Update UI notify the user they can install the PWA
      this.showAppInstallBanner = true;
    });
  }
}
</script>

<style lang="sass">
  .q-footer
    .q-tab__icon
      font-size: 30px
  .q-header
    .q-toolbar__title
      @media (max-width: $breakpoint-xs-max)
        text-align: center
      font-size: 30px
  .q-toolbar
    @media (min-width: $breakpoint-sm-min)
      height: 77px

</style>
