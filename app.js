// Init modules
var fs = require("fs");
var mysql = require("mysql")
var express = require("express");
var compress = require('compression');
var bodyParser = require("body-parser");

// Express is up
var app = express();

// Config
var config = app.locals.config = require('./config/config.json');

// Functions
var func = {} // Later defined
app.locals.func = func;

// Compress assets using GZip
app.use(compress());  

// Serve public dir with cache activated
app.use(express.static("static", {
    maxage: "365d"
}))

// Use Pug as template
app.set('view engine', 'pug');
app.set('views', 'views');


// Parse JSON in POST requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MySQL init
var coMysql = mysql.createConnection({
  host : config.MYSQL.HOST,
  user : config.MYSQL.USER,
  password : config.MYSQL.PASSWORD,
  database : config.MYSQL.DB
});
coMysql.connect(function(err) {
  if (err)
    console.error("Erreur lors de la connexion à la base MYSQL.");
});

// Define routes
app
.get('/', function (req, res) {
  func.getActus(function(actus) {
    res.render('index', { 
      ajax: req.query.ajax,
      actus : actus
    });
  });
})
.get('/grille-des-programmes', function (req, res) {
  res.render('grille-des-programmes', { 
    ajax: req.query.ajax
  });
})
.get('/podcasts', function (req, res) {
  func.getPodcasts(function(podcasts) {
    res.render('podcasts', { 
      ajax: req.query.ajax, 
      podcasts: podcasts
    });
  });
})
.get('/a-propos', function (req, res) {
  res.render('a-propos', { 
    ajax: req.query.ajax 
  });
})
.post('/get-programmation', function (req, res) {
    if (req.body.action == "last")
      func.getLastProg(req, res);
    else if (req.body.action == "around")
      func.getAroundProg(req, res);
    else if (req.body.action == "forWeek")
      func.getProg(req, res);
    else 
      res.sendStatus(400);
})
.all('*', function(req, res){
    // If no route catch up -> 404
    res.render('404');
});

// Launch the server
app.listen(config.PORT, function () {
  console.log(config.SITE.TITLE + " listening on port : " + config.PORT);
});

/////////////
// Functions

func.getPodcasts = function (cb) {
  var beautifulNames = [];
  var file = config.LINKNAMES_FILE;
  fs.readFile(file, 'utf-8', function(err, data) {
    var lines = data.trim().split("\n");
    for (line of lines) {
      var originalName = line.split(":")[0];
      var beautifulName = line.split(":")[1];
      beautifulNames[originalName] = beautifulName;
    };
    var podcasts = [];
    fs.readdir(config.PODCAST.FOLDER, function(err, files) {
      files.forEach(function (file) {
        if (file.substr(-4) == ".mp3") {
          var date = file.split("_")[0]; 
          var category = file.split("_")[1]; 
          var podcast = {};
          podcast.file = config.PODCAST.URL + file;
          podcast.date = date;
          podcast.originalCategory = category;
          podcast.category = beautifulNames[category] || category;
          podcasts.push(podcast);
        } 
      });
      cb(podcasts);
    });
  });
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
func.getProg = function (req, res) {
  var progs = [];
  file = config.PROG_FOLDER + "default_prog.csv";
  fs.readFile(file, 'utf-8', function(err, data) {
      if (err) {
        res.sendStatus(500);
        return;
      }
      var lines = data.trim().split("\n");
      for (line of lines) {
        line = line.split(";");
        var prog = {};
        prog.day = line[0];
        prog.hour = line[1];
        prog.duration = line[2];
        prog.name = line[3];
        prog.details = line[4];
        prog.podcastLink = line[5];
        prog.link = line[6];
        prog.cover = line[7];
        progs.push(prog);
      };
      res.send(progs);
  });
}
func.getActus = function(cb) {
  //var query = SELECT title, startDate, endDate, content, author, status, ordre FROM posts WHERE CURDATE()<= ADDDATE(endDate,6) ORDER BY ordre ASC LIMIT 10
  var query = 'SELECT title, startDate, endDate, content, author, status FROM posts';
  var actus = [];
  coMysql.query(query, function (error, results, fields) {
    if (error)
      return;
    for (var i in results){
      var actu = {};
      actu.title = results[i].title;
      actu.startDate = results[i].startDate;
      actu.endDate = results[i].endDate;
      actu.content = results[i].content;
      actu.author = results[i].author;
      actu.status = results[i].status;
      //actu.ordre = results[i].ordre;
      actus.push(actu);   
    }
    cb(actus);
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
