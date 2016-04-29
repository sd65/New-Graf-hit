// Init modules
var express = require('express');
var app = express();

// Config (defnied in package.json)
app.locals.config = require('./package.json').config;

// Public dir
app.use(express.static('static'));

// Use Pug template
app.set('view engine', 'pug');
app.set('views', 'views');

// Define routes
app
.get('/', function (req, res) {
    res.render('index');
})
.get('/about', function (req, res) {
    res.render('about');
})
.get('*', function(req, res){
    res.render('404');
});

// Launch the server
app.listen(app.locals.config.PORT, function () {
  console.log("App listening on port : " + app.locals.config.PORT);
});
