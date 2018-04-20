// Express Setup
const env = process.env.NODE_ENV || 'development';
const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const expressWs = require('express-ws')(app);
let PORT = process.env.SERVER_PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

if (env === 'production') {
  const credentials = {
    cert: fs.readFileSync('./ssl/fullchain.pem'),
    key: fs.readFileSync('./ssl/privkey.pem')
  };

  var http = express();
  http.get('*', function(req, res) {
    res.redirect('https://' + req.headers.host + req.url);
  });
  http.listen(3080,
    () => console.log('Server redirecting on port 3080!'));

  app.use(express.static('public'));

  http.get("*", function(req, res, next) {
    res.redirect("https://" + req.headers.host + "/" + req.path);
  });

  https.createServer(credentials, app).listen(PORT,
    () => console.log('Server listening on port ' + PORT + '!'));
} else {
  app.listen(PORT,
    () => console.log('Server listening on port ' + PORT + '!'));
}

module.exports = app;
