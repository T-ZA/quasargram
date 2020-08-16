/*
  Dependencies
*/
const express = require('express');
const admin = require('firebase-admin');

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
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


/*
  Endpoints
*/
app.get('/', (request, response) => {
  response.send('Quasargram PWA Backend');
});

// Get Posts
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
  Listen
*/
app.listen(port, () => {
  console.log(`Quasargram PWA Backend listening at http://localhost:${port}`);
});
