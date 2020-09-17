<template>
  <q-page class="constrain q-pa-md">
    <enable-notifications-banner />

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
          <post-skeleton
            v-for="i in 3"
            :key="i"
            class="q-mb-md"
          />
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
import { openDB } from 'idb';

export default {
  name: 'PageHome',
  components: {
    'post': () => import('src/components/Post.vue'),
    'post-skeleton': () => import('src/components/PostSkeleton.vue'),
    'enable-notifications-banner': () => import('src/components/EnableNotificationsBanner.vue')
  },
  data() {
    return {
      posts: [],
      loadingPosts: false
    }
  },
  computed: {
    serviceWorkerSupported() {
      if ('serviceWorker' in navigator) return true;
      return false;
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
      let getPostsURI = `${process.env.QUASARGRAM_BACKEND_API}/posts`;

      // Add a unique timestamp to request URL to prevent aggressive caching (IE)
      if (this.$q.platform.is.ie) {
        let uniqueForIE = `?timestamp=${Date.now()}`;
        getPostsURI += uniqueForIE;
      }

      this.$axios.get(getPostsURI)
        .then((result) => {
          this.posts = result.data;

          if (!navigator.onLine) {
            this.getOfflinePosts();
          }
        })
        .catch((error) => {
          console.error(error);
          this.$q.dialog({
            title: 'Error',
            message: 'Unable to get posts'
          });
        })
        .finally(() => this.loadingPosts = false);
    },

    getOfflinePosts() {
      let idb = openDB('workbox-background-sync')
        .then((db) => {
          return db.getAll('requests');
        })
        .then((failedRequests) => {
          // iterate over each failed request
          // and extract its form data to add offline posts to posts list
          failedRequests.forEach((failedRequest) => {
            // ensure entries in IndexedDb are for the 'createPostQueue' queue
            if (failedRequest.queueName === 'createPostQueue') {
              const request = new Request(failedRequest.requestData.url, failedRequest.requestData);

              // Extract form data from request
              request.formData()
                .then((formData) => {
                  let offlinePost = {};

                  offlinePost.offline = true;

                  offlinePost.id = formData.get('id');
                  offlinePost.caption = formData.get('caption');
                  offlinePost.location = formData.get('location');
                  offlinePost.date = parseInt(formData.get('date'));

                  // retrieve image from form data as data url
                  let reader = new FileReader();
                  reader.readAsDataURL(formData.get('file'));
                  reader.onloadend = () => {
                    offlinePost.imageUrl = reader.result;

                    // add offline post to beginning of posts array
                    this.posts.unshift(offlinePost);
                  }
                });
            }
          })
        })
        .catch((error) => {
          console.error('Error accessing IndexedDB: ', error);
        });
    },

    listenForOfflinePostUploaded() {
      if (this.serviceWorkerSupported) {
        // Listen out for offline-post-uploaded message from service worker
        // after an offline post has been successfully uploaded
        // https://stackoverflow.com/questions/42127148/service-worker-communicate-to-clients
        const channel = new BroadcastChannel('sw-messages');
        channel.addEventListener('message', (event) => {
            if (process.env.DEV) {
              console.log('Received offline-post-uploaded', event.data);
            }

            // For the offline-post-uploaded event
            if (event.data.msg == 'offline-post-uploaded') {
              // Get remaining number of offline posts
              let offlinePostCount = this.posts.filter((post) => post.offline == true).length;

              // Set the 'offline' property for an offline post in posts[] to false
              this.posts[offlinePostCount - 1].offline = false;
            }
        });
      }
    }
  },

  /*
    Lifecycle Hooks
  */
  // The 'activated' hook is used when a page surrounded with <keep-alive>
  // needs something to trigger every time that page is rendered
  activated() {
    this.getPosts();
  },

  created() {
    this.listenForOfflinePostUploaded();
  }
}
</script>

<style lang="sass">
  .card-post
    .q-img
      min-height: 200px
</style>
