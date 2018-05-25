app.factory("stat", ['$http','ipAddress', function(http, ip){
  var obj = {};
  obj.getHashtagStatic =  function(scope){
    var res = http.get("http://"+ip+":3700/chart/getJson");
    res.then(function(response){
      scope.labels = [];
      scope.data = [];
      $.each(response.data, function(k, v) {
        (scope.labels).push(k);
        (scope.data).push(v);
      });
      scope.hashtag = response.data;
    }, function(){
      alert("error")
    });
  };

  obj.getNumberOfPost = function(scope){
    var res = http.get("http://"+ip+":3700/chart/numPost");
    res.then(function(response){
      scope.num_of_post = response.data.post;
    }, function(){
      alert("error")
    });
  }
  return obj;
}]);

app.controller('tableHashtag',['$scope', 'stat','socket', function(scope, stat, socket){
 stat.getHashtagStatic(scope);
 stat.getNumberOfPost(scope);
 socket.on('new_post',function(data){
   scope.num_of_post++;
 });

}]);
