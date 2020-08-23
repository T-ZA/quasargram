<template>
  <div class="bg-primary">
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
          <q-btn
            label="Yes"
            dense
            flat
            class="q-px-sm"
          />
          <q-btn
            label="Later"
            dense
            flat
            class="q-px-sm"
          />
          <q-btn
            label="Never"
            dense
            flat
            class="q-px-sm"
          />
        </template>
      </q-banner>
    </div>
  </div>
</template>

<script>
  export default {

  }
</script>
