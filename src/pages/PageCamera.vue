<template>
  <q-page class="constrain-more q-pa-md">
    <!-- Image Preview -->
    <div class="camera-frame q-pa-md">
      <q-img
        class="full-width"
        src="https://cdn.quasar.dev/img/parallax2.jpg"
      />
    </div>

    <div class="text-center q-pa-md">
      <!-- Take Picture button -->
      <q-btn
        color="grey-10"
        icon="eva-camera"
        size="lg"
        round
      />

      <!-- Caption input -->
      <div class="row justify-center q-ma-md">
        <q-input
          v-model="post.caption"
          class="col col-sm-8"
          dense
          label="Caption"
        />
      </div>

      <!-- Location input -->
      <div class="row justify-center q-ma-md">
        <q-input
          v-model="post.location"
          class="col col-sm-8"
          dense
          label="Location"
        >
          <template v-slot:append>
            <q-btn
              icon="eva-navigation-2-outline"
              dense
              flat
              round
            />
          </template>
        </q-input>
      </div>

      <!-- Post Image button -->
      <div class="row justify-center q-mt-lg">
        <q-btn
          color="primary"
          label="Post Image"
          rounded
          unelevated
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { uid } from 'quasar';

export default {
  name: 'PageCamera',
  data() {
    return {
      post: {
        id: uid(),
        caption: '',
        location: '',
        photo: null,
        date: Date.now()
      }
    }
  }
}
</script>

<style lang="sass">
  .camera-frame
    border: 2px solid $grey-10
    border-radius: 10px
</style>
