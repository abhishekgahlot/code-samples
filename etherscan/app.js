const express = require('express');
const path = require('path');

// Custom modules
const config = require('./config');
const routes = require('./routes');
const { connectToMongo } = require('./dbConnect');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/client'));
app.use(express.static('client/assets'));
app.use(routes);

connectToMongo().then(() => {
  console.log('Connected to Mongo, Setting Indexes.'); // eslint-disable-line
  app.listen(config.appPort, () => console.log(`App listening on port ${config.appPort}!`)); // eslint-disable-line
});
