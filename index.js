//var cool = require('cool-ascii-faces');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express  = require('express');

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendfile('index.html');
});



// views is directory for all template files
//app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');



io.on('connection', function(socket){
	socket.on("requestID", function(data){
		console.log(data.playerName);
		var id=1;
		//socket.emit("receiveID", id);
		//STORE THE PLAYER NAME IN  AN ARRAY
		socket.emit("receiveID", {id_num: id});
	})

	socket.on("dataTransfer", function(data){
		console.log(data);
		io.sockets.emit("dataClient",data);
	});
});


var port = process.env.PORT || 5000;

http.listen(port, function(){
  console.log('Server started');
});
