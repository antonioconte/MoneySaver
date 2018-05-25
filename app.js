var express = require("express");
var http = require('http');
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var expressValidator = require("express-validator");
var app = express();
var server = http.createServer(app);
var flash = require('connect-flash');
var session = require("express-session");
var ip = require("ip").address();

// ROUTE
var auth = require('./routes/authenticate.js');
var home = require('./routes/home.js');
var post = require('./routes/post.js');
var chat = require('./routes/chat.js');
var chart = require('./routes/chart.js');

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.');
      var root    = namespace.shift();
      var formParam = root;
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
  }
}));
//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));
app.set('json spaces', 4);
app.use(flash());
// Global Vars
app.use(function(req, res, next){
  if(req.cookies.UserInfo){
    var cookieUser = (req.cookies.UserInfo).split('&');
    res.locals.IdByCookie = cookieUser[0];
    res.locals.NomeByCookie = cookieUser[1];
    res.locals.AvatarByCookie = cookieUser[3];
    res.locals.EmailByCookie =  cookieUser[2];
    res.locals.ipAddress = ip;
  }
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.errors = "";

  next();
});

var io = require('socket.io').listen(server);
io.on('connection', function(client){

  client.on('exit_user',function(data) {
    console.log(data);
    console.log(data.user + " si è disconnesso");
    io.sockets.emit('user_logout', data);
  });

  client.on('new_msg', function(data) {
    console.log(data);
    io.sockets.emit('new_msg', data)
  });

  client.on('new_post', function(data){
    console.log("E' stato aggiunto un nuovo post dall user con id " + data.id + " ("+data.user+")");
    io.sockets.emit('new_post', data);
  });

  client.on('new_user',function(data) {
    console.log(data.user + " si è connesso");
    io.sockets.emit('user_online', data);
  });
});

app.use('/', auth);
app.use('/', home);
app.use('/post', post);
app.use('/chat', chat);
app.use('/chart', chart);


server.listen('3700',ip, function(){
  console.log('Server in ascolto... ' + ip);
});
