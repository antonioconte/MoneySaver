var app = angular.module("myApp", ['cordovaNotificationModule','ngCookies','ui-notification','chart.js']);
app.factory('socket', ['$rootScope', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      function wrapper() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      }
      socket.on(eventName, wrapper);
      return function () {
        socket.removeListener(eventName, wrapper);
      };
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}])

app.config(function(NotificationProvider) {
  NotificationProvider.setOptions({
        delay: 5000,
        startTop: 60,
        startRight: 10,
        verticalSpacing: 10,
        horizontalSpacing: 10,
        positionX: 'right',
        positionY: 'bottom'
    });
});

app.value("ipAddress", $("#ipAddress").html());
function detMob(){
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ) return true;
 else  return false;
}
app.value("device", detMob());
