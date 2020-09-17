/*
  Dependencies
*/
const express = require('express');

const admin = require('firebase-admin');

const inspect = require('util').inspect;
const Busboy = require('busboy');

const path = require('path');
const os = require('os');
const fs = require('fs');

const UUID_V4 = require('uuid-v4');

const webpush = require('web-push');


/*
  config - Express
*/
const app = express();
// Heroku-specific since it assigns a port in environment vars
const port = (process.env.PORT) || 3000;


/*
  config - Firebase
*/
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'quasargram-3a115.appspot.com' // Firebase Storage bucket
});

const db = admin.firestore(); // Cloud Firestore
const bucket = admin.storage().bucket(); // Firebase Storage


/*
  config - webpush
*/
webpush.setVapidDetails(
  'mailto:ricky.sanders62@gmail.com',

  // public keyy
  'BBcgM9CoP8lTIawFSU5c0ZlowZp_X_Be6BTxFH40jg3WxIo7KyUJEalxqGqSLzIbYcZM4p1QKaUvWQfd2EaTeTk',

  // private key
  'TxcOl-sCCJhop1TVG6IQRworbPBimekP_JEAUMVKeiA'
);


/*
  Endpoint - Healthcheck
*/
app.get('/', (request, response) => {
  response.send('Quasargram PWA Backend');
});


/*
  Endpoint - Get Posts
*/
app.get('/posts', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.cookie('sameSite', 'None');
  response.cookie('secure');

  let posts = [];
  db.collection('posts').orderBy('date', 'desc').get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        posts.push(doc.data());
      });
      response.send(posts);
    });
});


/*
  Endpoint - Create Post
*/
app.post('/createPost', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.cookie('sameSite', 'None');
  response.cookie('secure');

  let uuid = UUID_V4();

  let busboy = new Busboy({ headers: request.headers });

  let postData = {};
  let fileData = {};

  // Occurs for each file in the form
  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    // File metadata
    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);

    // Store image file in the temp directory on the user's OS
    let filepath = path.join(os.tmpdir(), filename);
    file.pipe(fs.createWriteStream(filepath));

    fileData = {
      filepath,
      mimetype
    };

    // File is received for processing
    // file.on('data', function (data) {
    //   console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    // });

    // All file data is loaded
    // file.on('end', function () {
    //   console.log('File [' + fieldname + '] Finished');
    // });
  });

  // Occurs for each field in the form
  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    // console.log('Field [' + fieldname + ']: value: ' + inspect(val));

    // Add each field from the form into the postData array
    postData[fieldname] = val;
  });

  // End of form processing
  busboy.on('finish', function () {
    console.log(postData);

    // Upload the received image to Firebase Storage
    bucket.upload(fileData.filepath,
      {
        uploadType: 'media',
        metadata: {
          metadata: {
            contentType: fileData.mimetype,
            firebaseStorageDownloadTokens: uuid
          }
        }
      },
      (err, uploadedFile) => {
        // If image upload is successful,
        // create post document in Cloud Firestore
        if (!err) {
          createDocument(uploadedFile);
        }
      }
    );

    // Create document in Cloud Firestore
    function createDocument(uploadedFile) {
      db.collection('posts').doc(postData.id).set({
        id: postData.id,
        caption: postData.caption,
        location: postData.location,
        date: parseInt(postData.date),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${uploadedFile.name}?alt=media&token=${uuid}`
      })
        .then(() => {
          sendPostCreatedPushNotification();
          response.send(`Post added: ${postData.id}`);
        });
    }

    function sendPostCreatedPushNotification() {
      let subscriptions = [];
      db.collection('subscriptions').get()
        .then((snapshot) => {
          // Get all stored subscriptions for notifying users
          snapshot.forEach((doc) => {
            subscriptions.push(doc.data());
          });

          return subscriptions;
        })
        .then((subRes) => {
          subRes.forEach((subscription) => {
            const pushSubscription = {
              endpoint: subscription.endpoint,
              keys: {
                auth: subscription.keys.auth,
                p256dh: subscription.keys.p256dh
              }
            };

            const pushContent = {
              title: 'New Quasargram Post',
              body: 'New Post Added!',
              openUrl: '/#/'
            };

            const pushContentStringified = JSON.stringify(pushContent);

            webpush.sendNotification(pushSubscription, pushContentStringified);
          });
        })
        .catch((error) => console.error(error.message));
    }
  });

  request.pipe(busboy);
});

/*
  Endpoint - Create Subscription
*/
app.post('/createSubscription', (request, response) => {
  response.set('Access-Control-Allow-Origin', '*');
  response.cookie('sameSite', 'None');
  response.cookie('secure');

  console.log(request.query);

  db.collection('subscriptions').add(request.query)
    .then((docRef) => {
      response.send({
        message: 'Subscription added successfully',
        postData: request.query
      });
    });
});


/*
  Listen
*/
app.listen(port, () => {
  console.log(`Quasargram PWA Backend listening at http://localhost:${port}`);
});
