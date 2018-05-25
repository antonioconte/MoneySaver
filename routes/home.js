var express = require('express');
var app = express.Router();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/WebBet.db');
var multer = require("multer");
var upload = multer({dest: 'public/dist/img_profile'});
var fs = require("fs");

function getHashtag(text){
  var res = text.split("#");
  var hash = [];
  for(var i=1; i<res.length; i++){
    hash.push(res[i].split(" ")[0]);
  }
  for(var i=0; i<hash.length; i++){
    // console.log('sostitutisco #'+ hash[i]);
    text = text.replace("#"+hash[i], "<a href='/search/"+hash[i]+"'>#"+hash[i]+"</a>")
    // console.log(text);
  }
  return text;
}


function ensureAuthentication(req, res, next){
  if(!req.cookies.UserInfo) res.redirect('/login');
  else{
    if(req.url == '/login' || req.url == '/register') res.redirect('/');
    else next();
  }
}


app.get('/search/:hash', ensureAuthentication,function(req, res){
  var hash = req.params.hash;
  var query = "SELECT user.id, post.testo,  datetime(post.data, 'unixepoch','localtime') as data,user.Nome, user.Email "+
  "FROM post INNER JOIN user ON user.id = post.id_author " +
  "WHERE testo LIKE '%#"+hash+"%' "+
  "ORDER BY post.data DESC";
  db.all(query, function(err, rows){
    if(err) throw err;

    rows.forEach(function(item){
      item.testo = getHashtag(item.testo)
    });
    res.render("pages/post", {
      title: 'Posts',
      post: rows,
      canEdit: false
    });
  })
})

app.get('/',ensureAuthentication,function(req, res){
  var queryPost = "SELECT user.id, post.testo,  datetime(post.data, 'unixepoch','localtime') as data,user.Nome, user.Email "+
  "FROM post INNER JOIN user ON user.id = post.id_author " +
  "ORDER BY post.data DESC";
  db.all(queryPost, function(err, rows){
    rows.forEach(function(item){
      item.testo = getHashtag(item.testo)
    });

    res.render("pages/post", {
      title: 'Posts',
      post: rows,
      canEdit: false
    });

  });
});

// Modifica del profilo personale
app.get('/edit',ensureAuthentication,function(req, res){
  var id = (req.cookies.UserInfo).split('&')[0];
  db.all('SELECT * FROM user WHERE id='+id, function(err, rows){
    var item = rows[0];
    var user = {
      nome: item.Nome,
      email: item.Email,
      eta: item.Eta,
      prof: item.Professione,
      avatar: item.Avatar
    };
    res.render("pages/editProfile", {
      title: 'Edit Profile',
      user: user
    });
  });
});

app.get("/json", function(req,res){
  var data = (req.cookies.UserInfo).split("&");
  var user = {
    id: data[0],
    nome: data[1],
    email: data[2],
    avatar: data[3]
  }
  res.json(user)
})

app.post("/edit", ensureAuthentication, upload.single('file'), function(req, res){
  var id = (req.cookies.UserInfo).split('&')[0];
  /*FILE UPLOAD: permette il salvataggio
  del file con il suo nome e la sua estensione */
  if(req.file){
    var tmp_path = req.file.path;
    var name_img = (req.cookies.UserInfo).split('&')[2]+".png";
    var target_path = "public/dist/img_profile/"+name_img;
    fs.renameSync(tmp_path, target_path);
    console.log('- - - - Immagine Profilo modificata - - - -');
  }
  var nome = req.body.nome;
  var eta = req.body.eta;
  var prof = req.body.prof;
  req.checkBody('nome','Nome obbligatorio').notEmpty();

  var errors = req.validationErrors();
  if(errors){
    req.flash('error', errors);
  }else{
    var imm = "";
    if(req.file){
      imm = " , Avatar = '"+name_img+"' ";
    }
    var update_query = "UPDATE user " +
      "SET Nome = '"+nome+"', "+
      "Eta = '"+ eta+"', Professione = '"+prof+"'" + imm +
      " WHERE id="+id;
    db.run(update_query);
    req.flash('success', 'Modifiche effettuate');
    var cookie;
    if(req.file) cookie = [id,nome,(req.cookies.UserInfo).split('&')[2],name_img];
    else cookie = [id,nome,(req.cookies.UserInfo).split('&')[2],(req.cookies.UserInfo).split('&')[3]];
    res.clearCookie("UserInfo");
    res.cookie('UserInfo', cookie.join('&'),{ maxAge: 36000000000, httpOnly: true })
  }
  res.redirect('/profile/'+id);
});

//LISTA DEGLI UTENTI
app.get("/users", ensureAuthentication,function(req, res){
  db.all("SELECT * FROM user", function(err, rows){
    var users = [];
    for(var i = 0; i<rows.length; i++){
      users.push({
        id: rows[i].id,
        nome: rows[i].Nome,
        email: rows[i].Email,
        eta: rows[i].Eta,
        prof: rows[i].Professione,
        img: rows[i].Avatar
      });
    }
    res.render("pages/all_user", {
      title: "Users' List",
      users : users
    });
  });
});

// Profilo dell'utente selezionato
app.get("/profile/:id",ensureAuthentication, function(req, res,next){
  var id = req.params.id;
  var canEdit = false;
  var query = "SELECT post.id as id_post, user.id, user.Nome, user.Email, user.Eta, user.Professione, user.Avatar, post.testo, datetime(post.data, 'unixepoch','localtime') as data "+
  "FROM user INNER JOIN post ON user.id = post.id_author " +
  "WHERE user.id="+id+ " ORDER BY data DESC";
  db.all(query,function(err, rows){
    if(rows.length == 0){
      var query_noPost = "SELECT * FROM user WHERE id="+id;
      db.all(query_noPost, function(err, rows) {
        // console.log(rows.length);
        if(rows.length == 0) res.redirect("/");
        else{

        if(id == (req.cookies.UserInfo).split('&')[0]) canEdit = true;
        var user = {
          id: rows[0].id,
          nome: rows[0].Nome,
          email: rows[0].Email,
          eta: rows[0].Eta,
          prof: rows[0].Professione,
          img: rows[0].Avatar
        };
        res.render('pages/userProfile',{
          title: 'User: ' + rows[0].Nome,
          canEdit: canEdit,
          user: user,
          post: []
        });
      }
      });


    }
    else{
      if(id == (req.cookies.UserInfo).split('&')[0]) canEdit = true;
      var user = {
        id_post: rows[0].id_post,
        id: rows[0].id,
        nome: rows[0].Nome,
        email: rows[0].Email,
        eta: rows[0].Eta,
        prof: rows[0].Professione,
        img: rows[0].Avatar
      };
      rows.forEach(function(item){
        item.testo = getHashtag(item.testo)
      });
      res.render('pages/userProfile',{
        title: 'User: ' + rows[0].Nome,
        canEdit: canEdit,
        user: user,
        post: rows
      })
    }
  });
})


module.exports = app;
