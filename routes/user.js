var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db/WebBet.db');

module.exports.store = function(user) {
  var query = "INSERT into user(Nome, Email, Password) "+
    "VALUES ('"+user.name+"','"+user.email+"','"+user.pass+"')";
  var res = db.run(query);
};
