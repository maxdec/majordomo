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

// Gif Oracle
app.post('/gifme', function (req, res) {
  // Get info from the post
  var text = req.body.text.split('-c');
  var gifQuery = text[0];
  // Get gifs from giphy
  request('http://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=' + gifQuery, function (err, response, body) {
    if (err) res.send(err);
    var b = JSON.parse(body), random = Math.floor(Math.random() * (b.data.length - 1)) + 0;
    var payload;
    var url = b.data[random].url;
    var user = req.body.user_name;
    var caption = text[1];
    var gifTitle = text[0];
    if (caption) payload = 'Title: ' + gifTitle + '\nSent By '+ user + '\n~"' + caption + '"\n<' + url + '>';
    else if (!caption) payload = 'Title: '+ gifTitle + '\nSent By ' + user + '\n<' + url + '>';
    var options = {
      url: 'Your web hook integration url token here',
      method: 'POST',
      json: {text: payload, username: 'the bot name', icon_emoji: ':an emoji:'}
    };
    // Send gifs to slack channel
    request(options, function (err) {
      if (err) res.send(err);
    });
    res.send('Gif sent.');
  });
});

// Food Oracle
app.post('/lunch', function (req, res) {
  res.send(restaurants[getRandomInt(0, restaurants.length)]);
});

app.post('/help', function (req, res) {
  var help = '' +
    '/gifme keyword [-c "your caption"]\nreturns a gif with the keyword\n\n' +
    '/wheretoeat \nreturns a place to eat';
  res.send(help);
});

app.use(router);
var port = Number(process.env.PORT || 5000);
app.listen(port , function () {
  console.log('listining on port', port);
});
