// Init modules
var fs = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

// Config (definied in package.json)
app.locals.config = require('./config/config.json');
var config = app.locals.config;

// Functions
var func = {} // Later defined
app.locals.func = func;

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
    var podcasts = func.getPodcasts();
    res.render('podcasts', { 
      ajax: req.query.ajax, 
      podcasts: podcasts
    });
})
.get('/a-propos', function (req, res) {
    res.render('a-propos', { ajax: req.query.ajax } );
})
.post('/get-programmation', function (req, res) {
    if (req.body.action == "last")
      func.getLastProg(req, res);
    else if (req.body.action == "around")
      func.getAroundProg(req, res);
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

/////////////
// Functions
func.getPodcasts = function () {
  var beautifulNames = [];
  var file = config.LINKNAMES_FILE;
  data = fs.readFileSync(file, 'utf-8');
  var lines = data.trim().split("\n");
  for (line of lines) {
    var originalName = line.split(":")[0];
    var beautifulName = line.split(":")[1];
    beautifulNames[originalName] = beautifulName;
  };
  var podcasts = [];
  var files = fs.readdirSync(config.PODCAST_FOLDER);
  files.forEach(function (file) {
    if (file.substr(-4) == ".mp3") {
      var date = file.split("_")[0]; 
      var category = file.split("_")[1]; 
      var podcast = {};
      podcast.file = config.PODCAST_URL + file;
      podcast.date = date;
      podcast.originalCategory = category;
      podcast.category = beautifulNames[category] || category;
      podcasts.push(podcast);
    } 
  });
  return podcasts;
}
func.getLastProg = function (req, res) {
  var number = req.body.number || 1;
  var d = new Date();
  var file = d.getFullYear() + "-";
  file += func.twoDigitsNumber(d.getMonth()+1) + "-";
  file += d.getDate() + "_airplay.log";
  file = config.AIRPLAY_FOLDER + file;
  fs.readFile(file, 'utf-8', function(err, data) {
      if (err) {
        res.sendStatus(500);
        return;
      }
      var lines = data.trim().split("\n");
      var result = lines.slice(-number).reverse();
      res.send(result);  
  });
}
func.getAroundProg = function (req, res) {
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
        numberSearchMin = parseInt("" + d.getHours() + func.twoDigitsNumber(d.getMinutes()));
        d.setSeconds(d.getSeconds() + gap*2*60);
        numberSearchMax = parseInt("" + d.getHours() + func.twoDigitsNumber(d.getMinutes()));
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
},
func.formatDate = function (mdate) {
  return mdate.slice(6) + "/" + mdate.slice(4,6) + "/" + mdate.slice(0,4);
}
func.returnRelativeDate = function(i) {
  if (!i) var i = 0;
    var d = new Date();
    d.setSeconds(d.getSeconds() - 3600*24*i);
    return d.getDate() + "/" + func.twoDigitsNumber(d.getMonth()+1); 
}
func.twoDigitsNumber = function (s) { 
  return ("0" + s).slice(-2);
}
