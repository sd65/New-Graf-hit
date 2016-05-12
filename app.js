// Init modules
var fs = require('fs');
var express = require('express');
var sharejss = require("sharejss"); 
var bodyParser = require("body-parser");
var app = express();

// Useful functions
var lib = require("./lib.js");

// Config (definied in package.json)
app.locals.config = require('./config.json');
var config = app.locals.config;

// Custom shared functions
app.locals.myFunctions = sharejss("./static/js/shared.js"); 
var myFunctions = app.locals.myFunctions;

// Public dir
app.use(express.static('static'));

// Use Pug template
app.set('view engine', 'pug');
app.set('views', 'views');

// Parse JSON in POST
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Define routes
app
.get('/', function (req, res) {
    res.render('index', { ajax: req.query.ajax } );
})
.get('/grille-des-programmes', function (req, res) {
    res.render('grille-des-programmes', { ajax: req.query.ajax } );
})
.get('/podcasts', function (req, res) {
    res.render('podcasts', { ajax: req.query.ajax } );
})
.get('/a-propos', function (req, res) {
    res.render('a-propos', { ajax: req.query.ajax } );
})
.get('*', function(req, res){
    res.render('404');
})
.post('/get-programmation', function (req, res) {
    if (req.body.action == "last") {
      var number = req.body.number || 1;
      var d = new Date();
      var file = d.getFullYear() + "-";
      file += myFunctions.twoDigitsNumber(d.getMonth()+1) + "-";
      file += d.getDate() + "_airplay.log";
      file = config.AIRPLAY_FOLDER + file;
      fs.readFile(file, 'utf-8', function(err, data) {
          if (err) {
            res.sendStatus(500);
            return;
          }
          var lines = data.trim().split("\n");
          var result = lines.slice(-number);
          res.send(result);  
      });
    } else if (req.body.action == "around") {
      var date = req.body.date;
      var hour = req.body.hour;
      if (!date || !hour) res.sendStatus(400);
      else {
        var day = date.split("/")[0];
        var month = date.split("/")[1];
        var d = new Date();
        var file = d.getFullYear() + "-";
        file += month + "-" + day + "_airplay.log";
        file = config.AIRPLAY_FOLDER + file;
        fs.readFile(file, 'utf-8', function(err, data) {
            if (err) {
              res.sendStatus(404);
              return;
            }
            var hours = hour.split(":")[0];
            var minutes = hour.split(":")[1];
            var gap = 7;
            var d = new Date();
            d.setHours(hours);
            d.setMinutes(minutes);
            d.setSeconds(d.getSeconds() - gap*60);
            numberSearchMin = parseInt("" + d.getHours() + myFunctions.twoDigitsNumber(d.getMinutes()));
            d.setSeconds(d.getSeconds() + gap*2*60);
            numberSearchMax = parseInt("" + d.getHours() + myFunctions.twoDigitsNumber(d.getMinutes()));
            var results = [];
            var lines = data.trim().split("\n");
            lines.forEach(function (line) {
              var numberHour = line.split(" ")[0].slice(0,5).replace(":","");
              if (numberHour > numberSearchMin && numberHour < numberSearchMax)
                  results.push(line);
            });
            res.send(JSON.stringify(results));  
        });
      }
    } else res.sendStatus(400);
})

// Launch the server
app.listen(config.PORT, function () {
  console.log(config.SITE_TITLE + " listening on port : " + config.PORT);
});
