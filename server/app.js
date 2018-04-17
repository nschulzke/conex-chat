// Express Setup
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const expressWs = require('express-ws')(app);
const PORT = process.env.SERVER_PORT ? process.env.SERVER_PORT : 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('public'));

app.listen(PORT, () => console.log('Server listening on port ' + PORT + '!'));

module.exports = app;
