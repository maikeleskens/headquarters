//var cool = require('cool-ascii-faces');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express  = require('express');

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/game', function(req, res){
	res.sendfile('views/pages/game.html');
});

app.get('/play', function(req, res){
	res.sendfile('views/pages/play.html');
});

app.get('/afk', function(req, res){
	res.sendfile('views/pages/afk.html');
})

var xpositions =[];
var prev_xpositions = [];
var ypositions = [];
var prev_ypositions = [];
var devices =[];

var speedMultiplier = 8;


for (var i=0; i<9; i++){
	devices.push(0);
	xpositions.push(0);
	prev_xpositions.push(0);
	ypositions.push(0);
	prev_ypositions.push(0);
}


var connectedDevices=0;
// views is directory for all template files
//app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');
checkIfAfk();
function checkIfAfk(){
	setTimeout(function(){
		for (var i = 0; i<9; i++){
			if(xpositions[i] == prev_xpositions[i] &&
				ypositions[i] == prev_ypositions[i] && devices[i] !=0){
				console.log("user " + i + " needs to be removed");
				io.sockets.emit("removeMe", {id:i});
				//Add code to delete user and open device id serverside,
				//instead of waiting for a response from client.
				//device id is still taken when a user opens another app, goes to home screen or screen goes black
			}
			prev_xpositions[i] = xpositions[i];
			prev_ypositions[i] = ypositions[i];
		}

		checkIfAfk();
	},15000);
}

io.on('connection', function(socket){
	socket.on("requestID", function(data){
		console.log(data.playerName);
		connectedDevices++;
		devices.push(connectedDevices);

		var i = 0;
		while(i==devices[i]){
			i++;
		}
		devices[i] = i;
		var id = devices[i];
		//var id=1;

		//socket.emit("receiveID", id);
		//STORE THE PLAYER NAME IN  AN ARRAY
		socket.emit("receiveID", {id_num: id});

		console.log( devices[0] + ", " + devices[1] + ", " +
			devices[2] + ", " + devices[3] + ", " +
			devices[4] + ", " + devices[5] + ", " +
			devices[6] + ", " + devices[7] + ", " +
			devices[8]
		);
	})

	socket.on("imOnline", function(data){
		var id = parseInt(data.id);
		console.log(data);
	})

	socket.on("dataTransfer", function(data){
		
		var id = parseInt(data.id_num);
		var xmove = parseFloat(data.x) * speedMultiplier;
		var ymove = parseFloat(data.y) * speedMultiplier;

		xpositions[id] = xpositions[id] +xmove;
		ypositions[id] = ypositions[id] +ymove;

		console.log("x: "+ xpositions[id] + ", y: " +ypositions[id]);
		io.sockets.emit("dataClient", {
			id_num : id,
			x : xpositions[id],
			y : ypositions[id]
		})

		//io.sockets.emit("dataClient",data);
	})



	socket.on("pressedStart", function(data){
        console.log(data);
    })

    socket.on('userDisconnected', function(data){
    	console.log("user "+ data.remove_id + " left");
    	var remove_id = parseInt(data.remove_id);
    	devices[remove_id] =0;
    	xpositions[remove_id] = 0;
    	ypositions[remove_id] = 0;
    })
});



var port = process.env.PORT || 5000;

http.listen(port, function(){
  console.log('Server started');
});
