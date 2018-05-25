var express = require('express');
var app = express.Router();

function ensureAuthentication(req, res, next){
  if(!req.cookies.UserInfo) res.redirect('/login');
  else{
    if(req.url == '/login' || req.url == '/register') res.redirect('/');
    else next();
  }
}

app.get('/',ensureAuthentication, function(req, res){
  res.render('pages/chat', {
    title: 'Chat'
  });
});

module.exports = app;
