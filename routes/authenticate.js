var express = require('express');
var app = express.Router();
var User = require("./user.js");
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/WebBet.db');

function ensureAuthentication(req, res, next){
  if(!req.cookies.UserInfo) res.redirect('/login');
  else{
    if(req.url == '/login' || req.url == '/register') res.redirect('/');
    else next();
  }
}

app.get('/logout',function(req, res){
  res.clearCookie("UserInfo");
  res.redirect('/login')

})


// Login - Get
app.get('/login',function(req, res){
  if(req.cookies.UserInfo) res.redirect('/');
  res.render('pages/login');
});
// Login - Post
app.post('/login', function(req, res){
  var email = req.body.email;
  var pass =  req.body.password;
  var query = "SELECT * FROM user " +
  "WHERE email = '"+email+"' AND password = '"+pass+"'";
  db.all(query,function(err,rows){
    if(err) throw err;
    if(rows.length == 0){
      req.flash('error', 'Utente non trovato');
      res.render('pages/login',{
        errors: 'Utente non trovato'
      });
    }else{
      var cookie = [
         rows[0].id,
         rows[0].Nome,
         rows[0].Email,
         rows[0].Avatar
      ];
      res.cookie('UserInfo', cookie.join('&'),{ maxAge: 36000000000, httpOnly: true })
      res.redirect('/');
    }
  });
});

// Register - Get
app.get('/register', function(req, res){
  if(req.cookies.UserInfo) res.redirect('/');
  res.render('pages/register');
});

// Register - Post
app.post('/register', function(req, res){

  var name = req.body.full_name;
  var email = req.body.email;
  var password = req.body.password;
  req.checkBody('full_name','Nome obbligatorio').notEmpty();
  req.checkBody('email','Email obbligatoria').notEmpty();
  req.checkBody('email','Email non valida').isEmail();
  req.checkBody('password','Password obbligatoria').notEmpty();
  req.checkBody('password2', 'Le password non coincidono').equals(req.body.password);

  var errors = req.validationErrors();

  if(errors){
    res.render('pages/register',{
      errors: errors
    })

  }else{
    User.store({
      name: name,
      email: email,
      pass: password
    });
    req.flash('success', 'Ti sei registrato');
    res.redirect('login');

  }
});


module.exports = app;
