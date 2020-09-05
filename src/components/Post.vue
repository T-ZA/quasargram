<template>
  <q-card
    class="card-post"
    :class="{ 'bg-red-1': post.offline }"
    bordered
    flat
  >
    <!-- Display "Stored Offline" badge for offline posts -->
    <q-badge
      v-if="post.offline"
      class="absolute-top-right badge-offline"
      color="red"
      floating
    >
      Stored Offline
    </q-badge>

    <!-- Post Header (User, avatar, location) -->
    <q-item>
      <q-item-section avatar>
        <q-avatar>
          <img src="https://cdn.quasar.dev/img/boy-avatar.png">
        </q-avatar>
      </q-item-section>

      <q-item-section>
        <q-item-label>Username</q-item-label>
        <q-item-label caption>
          {{ post.location }}
        </q-item-label>
      </q-item-section>
    </q-item>

    <q-separator />

    <!-- Post image -->
    <q-img :src="post.imageUrl" :ratio="1"/>

    <!-- Post footer (post name, timestamp) -->
    <q-card-section>
      <div>{{ post.caption }}</div>
      <div class="text-caption text-grey">{{ post.date | humanReadableDate }}</div>
    </q-card-section>
  </q-card>
</template>

<script>
import { date } from 'quasar';
const { formatDate } = date;

export default {
  name: 'Post',
  props: ['post'],
  filters: {
    humanReadableDate(value) {
      return formatDate(value, 'MMMM D, YYYY h:mm A');
    }
  },
}
</script>

<style lang="sass" scoped>
  .card-post
    .badge-offline
        border-top-left-radius: 0 !important
    .q-img
      min-height: 200px
</style>
