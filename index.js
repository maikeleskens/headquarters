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


/*
app.get('/', function(request, response) {    //dit geberut er in root, headquarters.herokuapp.com
  //response.render('pages/index');
  //var result = ''
  //var times = process.env.TIMES || 5
  //for (i=0; i<times; i++)
  //	result += cool();
  //response.send(result);
  response.render('pages/index');
});*/





io.on('connection', function(socket){
	socket.emit('boop');
	socket.on('beep', function(){
		socket.emit('boop');
	});

	socket.on("dataTransfer", function(data){
		console.log(data);
		io.sockets.emit("dataClient",data);
	});
});



/*
app.get('/db', function(request, response){
	pg.connect(process.env.DATABASE_URL, function(err, client, done){
		client.query('SELECT * FROM test_table', function(err, result){
			done();
			if (err)
				{console.error(err); response.send("Error " + err);}
			else{response.render('pages/db', {results: result.rows}); }
		});
	});
})
*/

//app.set('port', (process.env.PORT || 5000));


//app.listen(app.get('port'), function() {
//  console.log('Node app is running on port', app.get('port'));
//});


/*
var io = require('socket.io')({
	transports: ['websocket'],
});

io.attach(4567);

io.on('connection', function(socket){
	socket.on('beep', function(){
		socket.emit('boop');
	});
})
*/

//var port = process.env.PORT || 5000;

//http.listen(port, function(){
//  console.log('serverIsworkin2');
//});

var port = process.env.PORT || 5000;

http.listen(port, function(){
  console.log('Server started');
});
