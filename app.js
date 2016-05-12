// Init modules
var express = require('express');
var sharejss = require("sharejss"); 
var bodyParser = require("body-parser");
var app = express();

// Useful functions
var lib = require("./lib.js");

// Config (definied in package.json)
app.locals.config = require('./config/config.json');
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
    var podcasts = lib.getPodcasts();
    console.log(podcasts);
    res.render('podcasts', { ajax: req.query.ajax } );
})
.get('/a-propos', function (req, res) {
    res.render('a-propos', { ajax: req.query.ajax } );
})
.post('/get-programmation', function (req, res) {
    if (req.body.action == "last")
      lib.getLastProg(req, res);
    else if (req.body.action == "around")
      lib.getAroundProg(req, res);
    else 
      res.sendStatus(400);
})
.all('*', function(req, res){
    res.render('404');
});

// Launch the server
app.listen(config.PORT, function () {
  console.log(config.SITE_TITLE + " listening on port : " + config.PORT);
});
