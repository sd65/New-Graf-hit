// Init modules
var fs = require('fs');
var express = require('express');
var sharejss = require("sharejss"); 
var bodyParser = require("body-parser");
var app = express();

// Config (definied in package.json)
app.locals.config = require('./config.json');

// Custom shared functions
app.locals.myFunctions = sharejss("./static/js/shared.js"); 

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
      if (req.body.numberLines < 0)
        var numberLines = 1;
      var d = new Date();
      var file = d.getFullYear() + "-" + app.locals.myFunctions.twoDigitsNumber(d.getMonth()+1) + "-" + d.getDate();
      file += "_airplay.log"
    } else
      res.status(400);
    file = app.locals.config.AIRPLAY_FOLDER + file;
    fs.readFile(file, 'utf-8', function(err, data) {
        if (err) throw err;
        var lines = data.trim().split('\n');
        if (req.body.action == "last") {
        var lastLine = lines.slice(-numberLines)[0];
        console.log(lastLine);  
        } else {
          true;
        }
    });
})

// Launch the server
app.listen(app.locals.config.PORT, function () {
  console.log("App listening on port : " + app.locals.config.PORT);
});
