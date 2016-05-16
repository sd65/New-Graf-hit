"use strict";

// Foundation init
$(document).foundation();

// Dom is ready
if (typeof domReady == 'function') { 
    domReady(); 
}

// Dynamic colors
function setDynamicColors(nb) {
  if(!nb) {
    var d = new Date();
    nb = d.getDate() + (d.getMonth() * 30);
  }
  var tint = nb % 255;
  var color = "hsl(" + tint + ", 60%, 75% )";
  var colorActive = "hsl(" + tint + ", 60%, 60% )";
  var colorHover = "hsl(" + tint + ", 60%, 65% )";
  var rule = "aside a.button, .title-bar { background-color: " + color + "}";
  var ruleActive = "aside a.button.active { background-color: " + colorActive + "}";
  var ruleHover = "aside a.button:hover { background-color: " + colorHover + "}";
  var ruleProgressBar = "#nprogress .bar { background: " + color + " !important}";
  var sheet = window.document.styleSheets[0];
  var insertAt = sheet.cssRules.length;
  sheet.insertRule(rule, insertAt);
  sheet.insertRule(ruleActive, insertAt);
  sheet.insertRule(ruleHover, insertAt);
  sheet.insertRule(ruleProgressBar, insertAt);
}
setDynamicColors();

// Ajax load of pages
NProgress.configure({ showSpinner: false });
$("aside a").click(function(event) {
  NProgress.start();
  event.preventDefault();
  var link = $(this).attr("href");
  var linkAjax = link + "?ajax=true";
  var title = $(this).text();
  var newTitle = document.title.split("|")[0] + "| " + title;
  NProgress.set(0.4);
  $.get(linkAjax, function(html) {
      NProgress.set(0.6);
      $("#content").html(html);
      window.history.pushState({"pageTitle": newTitle, "html": html}, "", link);
      refreshActivePageInMenu();
      NProgress.done();
      $('.title-bar').foundation('toggleMenu');
      domReady();
  });
});
window.onpopstate = function(e){
  if(e.state){
    document.getElementById("content").innerHTML = e.state.html;
    document.title = e.state.pageTitle;
  }
};

// Set menu active button
function refreshActivePageInMenu() {
  var activePage = window.location.pathname;
  $("aside a.button").removeClass("active");
  var selector = "aside a.button[href='" + activePage +"']";
  $(selector).addClass("active");
}
refreshActivePageInMenu();


// Set defaults select in menu
var selector = "#searchDate option[value='" + returnDate() + "']";
$(selector).attr("selected", "selected").text("Aujourd'hui");
selector = "#searchHour option[value^='" + (new Date).getHours() + "']";
$(selector).first().attr("selected", "selected");


// Set last 5
function refreshCurrentProg() {
  $.ajax({
    method: "POST",
    url: "/get-programmation",
    dataType: "json",
    data : {
      "action" : "last",
      "number" : 5
    }
  }).done(function(progs) {
    var html = "";
    $.each(progs, function(i, prog) {
      prog = removeSecFromProg(prog);
      if(i==0)
        prog = "<b>" + prog + "</b>";
      html += "<li>" + prog + "</li>";
    });
    $("#lastFive").html(html);
  }).fail(function(data) {
    $("#lastFive").text("Erreur.");
  });
}
refreshCurrentProg();
setInterval(refreshCurrentProg, 15*1000);


// Search
$("#search").click(function(event) {
  $("#searchResults").html("");
  $("#searchResultsIntro").addClass("hide");
  $.ajax({
    method: "POST",
    url: "/get-programmation",
    dataType: "json",
    data : {
      "action" : "around",
      "date" : $("#searchDate").val(),
      "hour" : $("#searchHour").val()
    }
  }).done(function(progs) {
    $("#searchResultsIntro").removeClass("hide");
    $("#search").addClass("active");
    var html = "";
    $.each(progs, function(i, prog) {
      prog = removeSecFromProg(prog);
      html += "<li>" + prog + "</li>";
    });
    $("#searchResults").html(html);
  }).fail(function(data) {
    $("#searchResults").text("Erreur.");
  });
});


// Player
var activeSong = document.getElementById("audio");
function makePlay (state) {
  if (state) {
    activeSong.play();
    $("#progress").show();
    $("#player #playPause").attr("src", "/img/pause.png");
  } else {
    activeSong.pause();
    $("#progress").hide();
    $("#player #playPause").attr("src", "/img/play.svg");
  }
}
$("#playPause").click(function(event) {
  if(activeSong.paused)
    makePlay(true);
  else
    makePlay(false);
});
$("#audio").bind('timeupdate', function() {
  if (!live()) {
    var percentageOfSong = (activeSong.currentTime/activeSong.duration);
    var currentTime = formatSecondsAsTime(activeSong.currentTime)
    var duration = formatSecondsAsTime(activeSong.duration)
    $("#progressText").text(currentTime + "/" + duration);
    $("#progress").attr("value", percentageOfSong);
  }
});
$("#progress").click(function(event) {
  if(!live()) {
    var percent = event.offsetX / this.offsetWidth;
    activeSong.currentTime = percent * activeSong.duration;
  }
});
function live() {
  if (isFinite(activeSong.duration))
    return false;
  return true;
}
function refreshCurrentTitle() {
  activeSong = document.getElementById("audio");
  if (live()) {
    $.ajax({
      method: "POST",
      url: "/get-programmation",
      dataType: "json",
      data : {
        "action" : "last",
        "number" : 1
      }
    }).done(function(prog) {
      prog = removeSecFromProg(prog[0]);
      prog = removeTimeFromProg(prog);
      $("#player #title").text(prog);
    }).fail(function(data) {
      $("#player #title").text("Erreur");
    });
  }
}
refreshCurrentTitle();
setInterval(refreshCurrentTitle, 2*1000);
//Player Menu
function returnToLive () {
  $('#playerMenu').foundation("close");
  var streamLive = $("#audio source").data("streamurl");
  activeSong.src = streamLive;
  $("#player #title").text("Chargement...")
  $("#progress").removeAttr("value");
  $("#progressText").html("<span class='badge'>Live</span>");
  activeSong.load();
  makePlay(true);
};
$("#returnToLive").click(function(event) {
  returnToLive();
});
$("#getStream").click(function(event) {
   var stream = $("#audio source").attr("src");
   window.location.href= stream;
});
// On any error, reload live
$("#audio").on("error", function (e) {
  alert("Il y a une erreur sur la lecture en cours, nous rechargeons le live");
  returnToLive();
});


// Podcasts
// Delegate the event to the main container
$("#content").on("click", "#podcast .thumbnail", function () {
   activeSong = document.getElementById("audio");
   activeSong.src = $(this).data("file");
   $("#player #title").text($(this).data("title"))
   activeSong.load();
   activeSong.play();
   makePlay(true);
});

// Prevent drag img
$("img").mousedown( function(e) { e.preventDefault() } ); // fix for IE


// Utils Functions
function twoDigitsNumber (s) { 
  return ("0" + s).slice(-2);
}
function returnDate () {
  var d = new Date();
  d.setSeconds(d.getSeconds() - 3600*24);
  return d.getDate() + "/" + ("0" + (d.getMonth()+1)).slice(-2); 
}
function formatSecondsAsTime(secs) {
  var hr  = Math.floor(secs / 3600);
  var min = Math.floor((secs - (hr * 3600))/60);
  var sec = Math.floor(secs - (hr * 3600) -  (min * 60));
  return twoDigitsNumber(min) + ':' + twoDigitsNumber(sec);
}
function removeTimeFromProg (s) {
  return s.slice(5);
}
function removeSecFromProg(s) {
  return s.slice(0,5) + s.slice(8);
}
