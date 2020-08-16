<template>
  <q-card
    class="card-post"
    bordered
    flat
  >
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

    <q-img :src="post.imageUrl" :ratio="1"/>

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
    .q-img
      min-height: 200px
</style>
