var express = require('express');
var app = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/WebBet.db');

function getHashtag(text){
  var res = text.split("#");
  var hash = [];
  for(var i=1; i<res.length; i++){
    hash.push(res[i].split(" ")[0].toLowerCase());
  }
  return hash;
}

function ensureAuthentication(req, res, next){
  if(!req.cookies.UserInfo) res.redirect('/login');
  else{
    if(req.url == '/login' || req.url == '/register') res.redirect('/');
    else next();
  }
}

app.get("/getJson",ensureAuthentication, function(req,res){
  db.all("SELECT testo FROM post", function(err, rows){
    var json = {};
    rows.forEach(function(item, index){
      var hash = getHashtag(item.testo);
      hash.forEach(function(item, index){
        if(json[item]) json[item] += 1;
        else json[item] = 1;
      })
    });
    res.json(json);
  });
});

app.get("/numPost",ensureAuthentication, function(req,res){
  db.all("SELECT id FROM post", function(err, rows){
    res.json({post: rows.length});
  });
});

app.get("/",ensureAuthentication, function(req,res){
  res.render('pages/chart', {
    title: "Hashtag's Statistic "
  });
});

module.exports = app;
