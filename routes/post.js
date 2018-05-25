var express = require('express');
var app = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/WebBet.db');

function ensureAuthentication(req, res, next){
  if(!req.cookies.UserInfo) res.redirect('/login');
  else{
    if(req.url == '/login' || req.url == '/register') res.redirect('/');
    else next();
  }
}

app.get('/new', ensureAuthentication, function(req, res) {
  res.render("pages/newPost",{
    title: 'New Post'
  });
});

app.post('/new', ensureAuthentication, function(req, res) {
  var text = req.body.text_post;
  req.checkBody("text_post","Inserire il testo").notEmpty();
  var errors = req.validationErrors();
  if(errors){
    req.flash('error', errors);
    res.redirect('/post/new');
  }else{
    var data = new Date().getTime() + "";
    data = data.substring(0,10);
    var id = (req.cookies.UserInfo).split('&')[0];
    var query_insert =
    "INSERT INTO post (id_author, testo, data) "+
    "VALUES ("+id+",'"+text+"', "+data+")";
    db.run(query_insert, function(err){
        if(err) throw err;
    });

    res.redirect('/post/new');
  }
});



app.get('/delete/:id_post', ensureAuthentication, function(req, res){
  var id_post= req.params.id_post;
  var id_user = req.cookies.UserInfo.split('&')[0];
  var query_delete = "DELETE FROM post WHERE id="+id_post;
  db.run(query_delete, function(err) {
    res.redirect("/profile/"+id_user);
  });
});


module.exports = app;
