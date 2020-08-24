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
        // Create post document in Cloud Firestore if image upload is successful
        if (!err) {
          createDocument(uploadedFile);
        }
      }
    );

    // Create document in Firebase
    function createDocument(uploadedFile) {
      db.collection('posts').doc(postData.id).set({
        id: postData.id,
        caption: postData.caption,
        location: postData.location,
        date: parseInt(postData.date),
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${uploadedFile.name}?alt=media&token=${uuid}`
      })
        .then(() => {
          response.send(`Post added: ${postData.id}`);
        });
    }
  });

  request.pipe(busboy);
});


/*
  Listen
*/
app.listen(port, () => {
  console.log(`Quasargram PWA Backend listening at http://localhost:${port}`);
});
