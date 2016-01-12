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

app.get('/join', function(req, res){
	res.sendfile('views/pages/join.html');
});

app.get('/play', function(req, res){
	res.sendfile('views/pages/play.html');
});

app.get('/afk', function(req, res){
	res.sendfile('views/pages/afk.html');
})

var screenwidth = 900;
var screenheight = 700;

var devices =[];

var playerNames = [];
var xpositions =[];
var ypositions = [];
var moveToX = [];
var moveToY = [];
var prev_xpositions = [];
var prev_ypositions = [];
var playerBoosting = [];

var easing = 0.1;

//TEMP PLAYER COLORS
var playerColors = [
	"#ff0000", "#3F8299", "#8C261E", "#FFA24D", "#582F7F", "#2F477F", "#2F7F31", "#FF3263", "#000000", "#000000", "#000000", "#000000", "#000000"
];

var maxUsers = 12;
var startAtUser = 1;

var standardSpeedMultiplier = 12;
var speedMultipliers = [];
var boostSpeed = 70;


for (var i=startAtUser; i<maxUsers+1; i++){
	devices[i] = 0;
	xpositions[i] = 9000;
	ypositions[i] = 9000;
	prev_xpositions[i] = 9000;
	prev_ypositions[i] = 9000;
	moveToX[i] = 9000;
	moveToY[i] = 9000;
	playerBoosting[i] = false;
	speedMultipliers[i] = standardSpeedMultiplier;
}


var connectedDevices=0;
// views is directory for all template files
//app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');
checkIfAfk();
serversideMove();


io.on('connection', function(socket){
	socket.on("requestID", function(data){
		console.log(data.playerName);
		connectedDevices++;
		devices.push(connectedDevices);

		var i = startAtUser;
		while(i==devices[i]){
			i++;
		}

		if (i < maxUsers){
		devices[i] = i;
		var id = devices[i];
		playerNames[id] = data.playerName;
		xpositions[id] = parseInt(data.startX);
		ypositions[id] = parseInt(data.startY);
		moveToX[id] = parseInt(data.startX);
		moveToY[id] = parseInt(data.startY);
		//var id=1;

		//socket.emit("receiveID", id);
		
		socket.emit("receiveID", {id_num: id});
		//SEND THE PLAYER NAME 
		io.sockets.emit("sendName", {
			_id: id,
			_playerName: playerNames[id],
			_playerColor: playerColors[id]
		});

		sendAllData();

		console.log(devices[1] + playerNames[1] + ", " +
			devices[2] + playerNames[2] + ", " + devices[3] + playerNames[3] + ", " +
			devices[4] + playerNames[4] + ", " + devices[5] + playerNames[5] + ", " +
			devices[6] + playerNames[6] + ", " + devices[7] + playerNames[7] + ", " +
			devices[8] + playerNames[8] 
		);
		} else {
			socket.emit("receiveID", {id_num: "full"});
		}
	})

	socket.on("requestAllCurrentData", function(){
		console.log(playerNames);
		socket.emit("setScreenSize", {
			swidth : screenwidth,
			sheight : screenheight
		})
		sendAllData();
	})

	socket.on("imOnline", function(data){
		var id = parseInt(data.id);
		console.log(data);
	})

	socket.on("dataTransfer", function(data){
		
		var id = parseInt(data.id_num);
		var xmove = parseFloat(data.x) * speedMultipliers[id];
		var ymove = parseFloat(data.y) * speedMultipliers[id];

		xpositions[id] = xpositions[id] +xmove;
		ypositions[id] = ypositions[id] +ymove;

		console.log(playerNames[id] + ": x: "+ xpositions[id] + ", y: " +ypositions[id]);
		io.sockets.emit("dataClient", {
			id_num : id,
			x : xpositions[id],
			y : ypositions[id]
		})
		//io.sockets.emit("dataClient",data);
	})

	socket.on("playerBoost", function(data){
		console.log("player " + data.id + " boosted!");
		playerBoosting[parseInt(data.id)] =true;
		speedMultipliers[parseInt(data.id)] = boostSpeed;
		io.sockets.emit("startCharge", {id : data.id});
		setTimeout(function(){
			playerBoosting[parseInt(data.id)] =false;
			speedMultipliers[parseInt(data.id)] = standardSpeedMultiplier;
			io.sockets.emit("stopCharge", {id : data.id});
		},250)
	})



	socket.on("pressedStart", function(data){
        console.log(data);
    })

    socket.on('userDisconnected', function(data){
    	var remove_id = parseInt(data.remove_id);
    	devices[remove_id] =0;
    	xpositions[remove_id] = screenwidth+9000;
		ypositions[remove_id] = 100;
		moveToX[remove_id] = screenwidth+9000;
		moveToY[remove_id] = 100;
    	playerNames[remove_id] = "";
    	sendAllData();
    	console.log("user "+ data.remove_id + " left");
    })

});

function serversideMove(){
	for (var i = startAtUser; i<maxUsers; i++){
		var dx = xpositions[i] - moveToX[i];
		var dy = ypositions[i] - moveToY[i];

		 if ( (dx >0.001 || dx < -0.001) && (dy > 0.001 || dy <-0.001) ){
		 	moveToX[i] = moveToX[i] + dx * easing;
		 	moveToY[i] = moveToY[i] + dy * easing;
		 } else{
		 	//moveToX[i] = xpositions[i];
		 	//moveToY[i] = ypositions[i];
		 }

		 if (moveToX[i] > screenwidth && moveToX[i]<screenwidth+750){
		 	xpositions[i] = 0;
		 	moveToX[i] = 0;
		 	resetPosition(i);
		 }
		 if (moveToX[i] < 0){
		 	xpositions[i] = screenwidth;
		 	moveToX[i] = screenwidth;
		 	resetPosition(i);
		 }
		 if (moveToY[i] >screenheight){
		 	ypositions[i] = 0;
		 	moveToY[i] = 0;
		 	resetPosition(i);
		 }
		 if(moveToY[i] <0){
		 	ypositions[i] = screenheight;
		 	moveToY[i] = screenheight;
		 	resetPosition(i);
		 }

		//moveToX[i] = xpositions[i];
		//moveToY[i] = ypositions[i];

		if (playerBoosting[i] == true){
			for (var j = startAtUser; j<maxUsers; j++){
				var distX = moveToX[i] - moveToX[j];
				var distY = moveToY[i] - moveToY[j];
				if (distX < 50 && distX > -50 && distY < 50 && distY > -50 && i != j){
					console.log("player " + i + " killed " + j);
					//temp move yposition of the players thats been hit
					xpositions[j] = screenwidth+9000;
					ypositions[j] = 100;
					moveToX[j] = screenwidth+9000;
					moveToY[j] = 100;
					io.sockets.emit("playerKilled", {
						id_num : j,
						x : xpositions[j],
						y : ypositions[j],
						killedBy : i
					})
					console.log("x: " + xpositions[j] + ", y: " + ypositions[j]);
					respawnPlayer(j);
				}
			}
		}
	}
	setTimeout(function(){
		serversideMove();
	},2)
}

function respawnPlayer(id){
	setTimeout(function(){
		xpositions[id] = 200;
		ypositions[id] =200;
		moveToX[id] = 200;
		moveToY[id] =200;

		io.sockets.emit("resetposition", {
			id_num : id,
			x : xpositions[id],
			y : ypositions[id]
		})
	},3000)
}

function resetPosition(id){
	io.sockets.emit("resetposition", {
		id_num : id,
		x : xpositions[id],
		y : ypositions[id]
	})
}

function checkIfAfk(){
	setTimeout(function(){
		for (var i = startAtUser; i<maxUsers; i++){
			if(xpositions[i] == prev_xpositions[i] &&
				ypositions[i] == prev_ypositions[i] && devices[i] !=0){
				console.log("user " + i + " needs to be removed");
				io.sockets.emit("removeMe", {id:i});
				devices[i] =0;
    			xpositions[i] = 50;
    			ypositions[i] = 100;
    			playerNames[i] = "";
    			console.log("user "+ i + " kicked for afk");
    			sendAllData();
				//Add code to delete user and open device id serverside,
				//instead of waiting for a response from client.
				//device id is still taken when a user opens another app, goes to home screen or screen goes black
			}
			prev_xpositions[i] = xpositions[i];
			prev_ypositions[i] = ypositions[i];
		}

		checkIfAfk();
	},25000);
}

    function sendAllData(){
		io.sockets.emit("sendAllCurrentData", {
			id_num : devices,
			playerName: playerNames,
			playerColor: playerColors,
			x : xpositions,
			y : ypositions,
			easing : easing
		});
		console.log("data send");
	}



var port = process.env.PORT || 5000;

http.listen(port, function(){
  console.log('Server started');
});
