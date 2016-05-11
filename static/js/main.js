// Foundation init
$(document).foundation();

// Dynamic colors
function setDynamicColors(nb) {
  if(!nb) {
    var d = new Date();
    var nb = d.getDate() + (d.getMonth() * 30);
  }
  var tint = nb % 255;
  var color = "hsl(" + tint + ", 60%, 75% )";
  var colorActive = "hsl(" + tint + ", 60%, 60% )";
  var colorHover = "hsl(" + tint + ", 60%, 65% )";
  var rule = "aside a.button, .title-bar { background-color: " + color + "}"
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
var selector = "#searchDay option[value='" + returnDate() + "']";
$(selector).attr("selected", "selected").text("Aujourd'hui");
selector = "#searchHour option[value^='" + (new Date).getHours() + "']";
$(selector).first().attr("selected", "selected");


// Set last
$.ajax({
    url: "/get-programmation",
    data : { 
      "action" : "last" 
    },
    dataType: "application/json",
    method: "POST"
}).success(function(data) {
    console.log(data)
});
