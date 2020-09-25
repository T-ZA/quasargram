<template>
  <q-page class="constrain-more q-pa-md">
    <!-- Image Preview -->
    <div class="camera-frame q-pa-md">
      <!-- Camera Feed -->
      <video
        v-show="!imageCaptured"
        class="full-width"
        autoplay
        playsinline
        ref="video"
        src=""
      />

      <!-- Canvas (to capture image from camera) -->
      <canvas
        v-show="imageCaptured"
        class="full-width"
        height="240"
        ref="canvas"
      />
    </div>

    <div class="text-center q-pa-md">
      <!-- Take Picture button -->
      <q-btn
        v-if="hasCameraSupport"
        @click="captureImage()"
        color="grey-10"
        :disable="imageCaptured"
        icon="eva-camera"
        size="lg"
        round
      />

      <!-- File Picker (fallback for no camera access) -->
      <q-file
        v-else
        v-model="imageUpload"
        @input="captureImageFallback"
        accept="image/*"
        label="Choose an image"
        outlined
      >
        <template v-slot:prepend>
          <q-icon name="eva-attach-outline" />
        </template>
      </q-file>

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
          :loading="locationLoading"
        >
          <!-- Get Location button -->
          <template v-slot:append>
            <q-btn
              v-if="locationSupported && !locationLoading"
              @click="getLocation()"
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
          @click="addPost()"
          color="primary"
          :disable="!post.caption.length || !post.photo"
          label="Post Image"
          rounded
          unelevated
          class="q-mb-lg"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { uid } from 'quasar';
require('md-gum-polyfill'); // getUserMedia() polyfill

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
      },

      imageCaptured: false,
      imageUpload: [],
      hasCameraSupport: true,

      locationLoading: false,
      hasLocationSupport: true
    }
  },


  computed: {
    locationSupported() {
      if ('geolocation' in navigator) return true;
      return false;
    },

    backgroundSyncSupported() {
      if ('serviceWorker' in navigator && 'SyncManager' in window) return true;
      return false;
    }
  },


  methods: {
    initCamera() {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          this.$refs.video.srcObject = stream;
          this.imageCaptured = false;
        })
        .catch((error) => {
          this.hasCameraSupport = false;
        });
    },

    disableCamera() {
      this.$refs.video.srcObject.getVideoTracks().forEach((track) => {
        track.stop();
      });
    },

    captureImage() {
      let video = this.$refs.video;
      let canvas = this.$refs.canvas;

      canvas.width = video.getBoundingClientRect().width;
      canvas.height = video.getBoundingClientRect().height;

      let context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      this.imageCaptured = true;

      this.post.photo = this.dataURItoBlob(canvas.toDataURL());

      this.disableCamera();
    },

    captureImageFallback(file) {
      this.post.photo = file;

      let canvas = this.$refs.canvas;
      let context = canvas.getContext('2d');

      // https://stackoverflow.com/questions/10906734/how-to-upload-image-into-html5-canvas
      // http://jsfiddle.net/influenztial/qy7h5/
      var reader = new FileReader();
      reader.onload = (event) => {
        var img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            this.imageCaptured = true;
        }
        img.src = event.target.result;
      }
      reader.readAsDataURL(file);
    },

    // https://stackoverflow.com/questions/12168909/blob-from-dataurl
    dataURItoBlob(dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      var byteString = atob(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);

      // create a view into the buffer
      var ia = new Uint8Array(ab);

      // set the bytes of the buffer to the correct values
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      var blob = new Blob([ab], {type: mimeString});
      return blob;
    },

    getLocation() {
      this.locationLoading = true;

      navigator.geolocation.getCurrentPosition((position) => {
        this.getLocationData(position);
      }, (error) => {
        this.locationError();
      },
      {
        timeout: 7000
      });
    },

    getLocationData(position) {
      let apiUrl = `https://geocode.xyz/${position.coords.latitude},${position.coords.longitude}?json=1`;

      this.$axios.get(apiUrl)
        .then((result) => this.locationSuccess(result))
        .catch((error) => this.locationError());
    },

    locationSuccess(result) {
      this.post.location = `${result.data.city}`;

      // Add state if present in location result data
      if (result.data.state) {
        this.post.location += `, ${result.data.state}`;
      }

      // Add country if present in location result data
      if (result.data.country) {
        this.post.location += `, ${result.data.country}`;
      }

      this.locationLoading = false;
    },

    locationError() {
      let errorMessage = 'Unable to find your location.';
      if (this.$q.platform.is.mac) {
        errorMessage += 'You might be able to fix this in System Preferences > Security & Privacy > Location Services.';
      }

      this.$q.dialog({
        title: 'Error',
        message: errorMessage
      });

      this.locationLoading = false;
    },

    addPost() {
      this.$q.loading.show();

      // Get postCreated flag from LocalStorage prior to making a post
      let postCreated = this.$q.localStorage.getItem('postCreated');

      // If offline on Android and have not created a successful post,
      // return an error message to the user that it will not work
      // (users on Android need to successfully create a post prior to background sync working)
      if (this.$q.platform.is.android && !postCreated && !navigator.onLine) {
        this.addPostError();
        this.$q.loading.hide();
      }
      else {
        let requestForm = new FormData();

        requestForm.append('id', this.post.id);
        requestForm.append('caption', this.post.caption);
        requestForm.append('location', this.post.location);
        requestForm.append('date', this.post.date);
        requestForm.append('file', this.post.photo, this.post.id + '.png');

        this.$axios.post(`${process.env.QUASARGRAM_BACKEND_API}/createPost`, requestForm)
          .then((response) => {
            console.log('/createPost response: ', response);

            // Set flag in LocalStorage that the user has at least created one successful online post
            this.$q.localStorage.set('postCreated', true);

            // Redirect to home after successful post
            this.$router.push('/');

            // Notify of post success
            this.$q.notify({
              progress: true,
              timeout: 3000,
              message: 'Post created!',
              color: 'positive',
              actions: [
                {
                  label: 'Dismiss', color: 'white'
                }
              ]
            });
          })
          .catch((error) => {
            console.error(error);

            // If error is due to being offline
            // and browser supports background sync,
            // re-route to home page
            console.log('online: ', navigator.onLine);
            console.log('backgroundSync: ', this.backgroundSyncSupported);
            console.log('postCreated: ', postCreated);

            if (!navigator.onLine && this.backgroundSyncSupported && postCreated) {
              this.$q.notify('Post created offline');
              this.$router.push('/');
            }
            else {
              this.addPostError();
            }
          })
          .finally(() => this.$q.loading.hide());
      }
    },

    addPostError() {
      // Display error dialog
      this.$q.dialog({
        title: 'Error',
        message: 'Unable to create post'
      });
    }
  },


  /*
    Lifecycle Hooks
  */
  mounted() {
    this.imageCaptured = true;
    this.initCamera();
  },


  beforeDestroy() {
    if (this.hasCameraSupport) {
      this.disableCamera();
    }
  }
}
</script>

<style lang="sass">
  .camera-frame
    border: 2px solid $grey-10
    border-radius: 10px
</style>
