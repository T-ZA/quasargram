/*
  Dependencies
*/
const express = require('express');

/*
  config - Express
*/
const app = express();
// Heroku-specific since it assigns a port in environment vars
const port = (process.env.PORT) || 3000;


/*
  Endpoints
*/
app.get('/', (request, response) => {
  response.send('Quasargram PWA Backend');
});

app.get('/posts', (request, response) => {
  let posts = [
    {
      id: 1,
      caption: 'Lorem ipsum dolor',
      date: 1597271110186,
      location: 'Los Angeles, United States of America',
      imageUrl: 'https://cdn.quasar.dev/img/parallax2.jpg'
    },
    {
      id: 2,
      caption: 'Lorem ipsum dolor',
      date: 1597271110186,
      location: 'Miami, United States of America',
      imageUrl: 'https://cdn.quasar.dev/img/parallax2.jpg'
    },
  ];

  response.send(posts);
})


/*
  Listen
*/
app.listen(port, () => {
  console.log(`Quasargram PWA Backend listening at http://localhost:${port}`)
})
