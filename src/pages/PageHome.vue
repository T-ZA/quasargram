<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">

      <!-- Left column (posts) -->
      <div class="col-12 col-sm-8">
        <template v-if="!loadingPosts && posts.length">
          <post
            v-for="(post, index) in posts"
            :key="index"
            :post="post"
            class="q-mb-md"
          />
        </template>

        <template v-else-if="!loadingPosts && !posts.length">
          <h5 class="text-center text-grey">No Posts Yet</h5>
        </template>

        <template v-else>
          <post-skeleton class="q-mb-md" />
        </template>
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
export default {
  name: 'PageHome',
  components: {
    'post': () => import('src/components/Post.vue'),
    'post-skeleton': () => import('src/components/PostSkeleton.vue')
  },
  data() {
    return {
      posts: [],
      loadingPosts: false
    }
  },
  methods: {
    getPosts() {
      this.loadingPosts = true;
      // setTimeout(() => {
      //   this.$axios.get('http://localhost:3000/posts')
      //   .then((result) => {
      //     this.posts = result.data;
      //   })
      //   .catch((error) => {
      //     console.error(error);
      //     this.$q.dialog({
      //       title: 'Error',
      //       message: 'Unable to get posts'
      //     });
      //   })
      //   .finally(() => this.loadingPosts = false)
      // }, 3000);
      this.$axios.get(`${process.env.QUASARGRAM_BACKEND_API}/posts`)
        .then((result) => {
          this.posts = result.data;
        })
        .catch((error) => {
          console.error(error);
          this.$q.dialog({
            title: 'Error',
            message: 'Unable to get posts'
          });
        })
        .finally(() => this.loadingPosts = false);
    }
  },

  /*
    Lifecycle Hooks
  */
  created() {
    this.getPosts();
  }
}
</script>

<style lang="sass">
  .card-post
    .q-img
      min-height: 200px
</style>
