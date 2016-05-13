function returnDate(i) {
  if (!i) var i = 0;
  var d = new Date();
  d.setSeconds(d.getSeconds() - 3600*24*i);
  return d.getDate() + "/" + ("0" + (d.getMonth()+1)).slice(-2); 
}

function formatTime (mdate) {
  var date = new Date(mdate);
  return date.getHours() + "h" + ('0' + date.getMinutes()).slice(-2);
}

function formatDate (mdate) {
  return mdate.slice(6) + "/" + mdate.slice(4,6) + "/" + mdate.slice(0,4);
}

function twoDigitsNumber (s) { 
  return ("0" + s).slice(-2);
}

function defaultString (s,d) { 
  return (typeof s === 'undefined') ? d : s;
}

function removeSecFromProg(s) {
  return s.slice(0,5) + s.slice(8);
}
