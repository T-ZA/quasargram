<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">
      <!-- Left column (posts) -->
      <div class="col-12 col-sm-8">
        <div
          v-for="(post, index) in posts"
          :key="index"
          class="q-mb-md"
        >
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

            <q-img :src="post.imageUrl" />

            <q-card-section>
              <div>{{ post.caption }}</div>
              <div class="text-caption text-grey">{{ post.date | humanReadableDate }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Right column (mini profile) -->
      <div class="col-4 large-screen-only">
        <q-item class="fixed">
          <q-item-section avatar>
            <q-avatar size="48px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>Display Name</q-item-label>
            <q-item-label caption>@Username</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>

  </q-page>
</template>

<script>
import { date } from 'quasar';
const { formatDate } = date;

export default {
  name: 'PageHome',
  data() {
    return {
      posts: [
        {
          id: 1,
          caption: 'Lorem ipsum dolor',
          date: 1597271110186,
          location: 'Los Angeles, CA',
          imageUrl: 'https://cdn.quasar.dev/img/parallax2.jpg'
        },
        {
          id: 2,
          caption: 'Lorem ipsum dolor',
          date: 1597271110186,
          location: 'Los Angeles, CA',
          imageUrl: 'https://cdn.quasar.dev/img/parallax2.jpg'
        },
        {
          id: 3,
          caption: 'Lorem ipsum dolor',
          date: 1597271110186,
          location: 'Los Angeles, CA',
          imageUrl: 'https://cdn.quasar.dev/img/parallax2.jpg'
        }
      ]
    }
  },
  filters: {
    humanReadableDate(value) {
      return formatDate(value, 'MMMM D, YYYY h:mm A');
    }
  }
}
</script>

<style lang="sass">
  .card-post
    .q-img
      min-height: 200px
</style>
