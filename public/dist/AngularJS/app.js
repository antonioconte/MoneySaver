function notificationMobile(scope, cordovaNotification){
	scope.notificationService = cordovaNotification;
	scope.alertResult = '-';
	scope.confirmResult = '-';
	scope.promptResult = '-';
	cordovaNotification.alert('A simple alert!', function(){ scope.alertResult = 'Dismissed!'; });
	cordovaNotification.vibrate(2000);

	scope.alert = function() {
		cordovaNotification.alert('A simple alert!', function(){ scope.alertResult = 'Dismissed!'; });
	};

		/**
		 * Confirm API sample.
		 */
		scope.confirm = function() {
			cordovaNotification.confirm('A simple confirmation!', function(buttonIndex){ scope.confirmResult = 'Dismissed with button {' + buttonIndex + '}!'; });
		};

		/**
		 * Prompt API sample.
		 */
		scope.prompt = function() {
			cordovaNotification.prompt('A simple confirmation!', function(result){ scope.promptResult = 'Dismissed with button {' + result.buttonIndex + '} and value {' + result.input1 + '}!'; });
		};

		/**
		 * Beep API sample.
		 */
		scope.beep = function() {
			cordovaNotification.beep(5);
		};

		/**
		 * Vibrate API sample.
		 */
		scope.vibrate = function() {
		};
}


app.controller("mainCtrl", ['device','$scope','$http','socket','$cookies', 'Notification','ipAddress','cordovaNotificationService', function(device,scope, http, socket,cookies, Notification, ipAddress, cordovaNotification) {
	var user = $("#user_name").html();
	var id = $("#id_user").html();
	var ip = ipAddress;
	scope.msg = [];
	// alert(device)
	if(device) notificationMobile(scope, cordovaNotification);


	if(!cookies.get('myCookieforInfoConnect')){
		//Se il cookie esiste allora l'accesso è stato già effettuato
		cookies.put('myCookieforInfoConnect', 'isAlredyLogged')
		socket.emit('new_user',{
			id: id,
			user: user
		});
	}

	scope.nome_dest_chat = "";
	scope.contact = function(id, nome) {
			scope.reading_msg = true;
			scope.nome_dest_chat = nome;
			scope.dest_to_chat = id;
			$(".modal").modal();
	}

	scope.send = function() {
		var text = scope.text_to_send;
		var msg = {
			nome_mitt: user,
			mitt: parseInt(id),
			nome_dest: scope.nome_dest_chat,
			dest: scope.dest_to_chat,
			text: text,
			data: new Date()
		};
		socket.emit('new_msg', msg);
		msg.mitt = 'right'; //utile per la fase di visualizzazione
		(scope.msg).push(msg)
		scope.text_to_send = "";
	}

	scope.newPost = function(){
		// Mando il messaggio che è stato aggiunto un nuovo post
		// dall'user con id. In questo modo posso controllare se visualizzare la
		// notifica
		var text = $("[name='text_post']").val();
		if(text == "") return;
		socket.emit('new_post', {
			id: id,
			user: user,
			msg: $("[name='text_post']").val()
		})
	}

	scope.exit_user = function(user) {
		cookies.remove('myCookieforInfoConnect')
		socket.emit('exit_user', {
			id: id,
			user: $("#user_name").html()
		});
	}

	socket.on('new_msg', function(data){
		if(data.dest == id){
			console.log(data);
			(scope.msg).push(data);
			if(!scope.reading_msg){
				Notification.success({
					message: 'from ' + data.nome_mitt,
					title: 'New Message received'
				})
			}

		}
	})

	socket.on('new_post',function(data){
		scope.socket_new_post = [];
		if(data.id != id){
			if(location.href == 'http://'+ip+":3700/")
				(scope.socket_new_post).unshift(data);
			Notification.success({
				message: 'from ' + data.user,
				title: 'New Post'
			});
		}
	});

	socket.on('user_online', function(data){
			if(data.id != id){
				Notification.success({
					message: data.user + " is online!",
					title: 'User Online'
				});
			}
	});

	socket.on('user_logout', function(data){
		if(data.id != id){
			Notification.error({
				message: data.user + " is offline!",
				title: 'User Offline'
			});
		}
	});

}]);
