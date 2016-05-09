// Init modules
var express = require('express');
var app = express();

// Config (defnied in package.json)
app.locals.config = require('./config.json');

// Public dir
app.use(express.static('static'));

// Use Pug template
app.set('view engine', 'pug');
app.set('views', 'views');

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
});

// Launch the server
app.listen(app.locals.config.PORT, function () {
  console.log("App listening on port : " + app.locals.config.PORT);
});
