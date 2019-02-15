var express = require('express');
var app = express();
var url = require('url');
var request = require('request');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('port', (process.env.PORT || 9001));

var VERIFICATION_TOKEN = process.env.SLACK_VERIFICATION_TOKEN || 'faketoken';
var API_TOKEN = process.env.API_ACCESS_TOKEN || 'fakeapitoken';
var BOT_TOKEN = process.env.BOT_USER_ACCESS_TOKEN || 'fakebottoken';

function post_message(channel, text) {
  request.post("https://slack.com/api/chat.postMessage", {
    json: true,
    body: {
      token: BOT_TOKEN,
      channel: channel,
      text: text
    },
    headers: {
      'Authorization': 'Bearer ' + BOT_TOKEN,
      'Content-Type': 'application/json'
    }
  }, function (err, res) {
    console.log('error', err);
    console.log('response', res.body);
  });
}

app.get('/', function (req, res) {
  res.send('It works!');
});

app.post('/event', function (req, res) {
  switch (req.body.type) {
    case "url_verification":
      var token = req.body.token;
      var challenge = req.body.challenge;

      if (token === VERIFICATION_TOKEN) {
        res.send({
          challenge: challenge
        });
      } else {
        res.status(403);
        res.send('');
      }
      break;
    case "event_callback":
      var event_body = req.body.event;

      switch (event_body.type) {
        case "app_mention":
          post_message(event_body.channel, "🗣🤚");
          res.status(200);
          res.send('');
          break;
        default:
          console.log('unknown callback event type: ' + event_body.type);
          console.log(Object.keys(event_body));
          res.status(400);
          res.send('');
          break;
      }
      break;
    default:
      console.log('unknown event type: ' + req.body.type);
      console.log(Object.keys(req.body));
      res.status(400);
      res.send('');
      break;
  }
});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
