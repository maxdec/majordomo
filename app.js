'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var restaurants = ['Viet', 'Gemüse Kebap', 'Mama Kalo', 'Pizzas', 'Schiller', 'Picpic @ Templehof', 'Cooking'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.get('/', function (req, res) {
  res.send('Running');
});

/**
 * Example of body:
 * token=V6qJflIDP74OWBHaQB70eUTY
 * team_id=T0001
 * channel_id=C2147483705
 * channel_name=test
 * timestamp=1355517523.000005
 * user_id=U2147483697
 * user_name=Steve
 * command=/weather
 * text=94070
 *
 * Response must be a JSON:
 *   {
 *     "text": "African or European?"
 *   }
 */
app.post('/', securityChecker,
              parametizer,
              dispatcher);

app.use(router);
var port = Number(process.env.PORT || 5000);
app.listen(port , function () {
  console.log('listining on port', port);
});


var actions = {};

/**
 * Get a GIF
 */
actions.gifme = function (req, res) {
  var gifQuery = req.action.params.join(' ');
  // Get gifs from giphy
  request('http://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=' + gifQuery, function (err, response, body) {
    if (err) return res.send(err);
    var b = JSON.parse(body);
    var random = getRandomInt(0, b.data.length - 1);
    res.send(b.data[random].url);
  });
};

/**
 * Where to go for lunch?
 */
actions.lunch = function (req, res) {
  res.send(restaurants[getRandomInt(0, restaurants.length - 1)]);
};

/**
 * What's playing on the jukebox
 */
actions.jukebox = function (req, res) {
  res.send('Nicolas Jaar - Mi Mujer');
};

/**
 * Help menu
 */
actions.help = function (req, res) {
  var help = '' +
    '/majordomo gifme keyword\nreturns a gif with the keyword\n\n' +
    '/majordomo lunch\nreturns a place to eat';
  res.send(help);
};

/**
 * Checks that the message really comes from our Slack Integration.
 */
function securityChecker(req, res, next) {
  if (req.body.token !== process.env.SLACK_TOKEN) return res.send(403);
  next();
}

/**
 * Transforms the body into usefuls parameters.
 *
 * Example of body:
 *
 * token=V6qJflIDP74OWBHaQB70eUTY
 * team_id=T0001
 * channel_id=C2147483705
 * channel_name=test
 * timestamp=1355517523.000005
 * user_id=U2147483697
 * user_name=Steve
 * command=/weather
 * text=94070
 */
function parametizer(req, res, next) {
  req.user = {
    id: req.body.user_id,
    name: req.body.user_name
  };

  req.channel = {
    id: req.body.channel_id,
    name: req.body.channel_name
  };

  var words = req.body.text.split(' ');
  req.action = {
    name: words[0],
    params: words.slice(1)
  };

  next();
}

/**
 * Call the function corresponding to the action received.
 */
function dispatcher(req, res, next) {
  if (!actions[req.action.name]) return res.send(404);
  actions[req.action.name](req, res, next);
}
