var fs = require("fs");

// Config (definied in package.json)
var config = require('./config/config.json');

// Custom shared functions
var sharejss = require("sharejss"); 
var myFunctions = sharejss("./static/js/shared.js"); 

module.exports = {

  getPodcasts: function () {
    return "ss";
  },

  getLastProg: function (req, res) {
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
  },

  getAroundProg: function (req, res) {
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
  }

};
