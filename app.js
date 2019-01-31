var http = require('http');
var fs = require('fs');

// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Chargement de socket.io
var io = require('socket.io').listen(server);

var idConnection=0;

io.sockets.on('connection', function (socket, pseudo) {
    // on verifie le nombre de connection
    if (idConnection<2) {
    	idConnection++;
    	console.log('nombre de connectés = '+idConnection);
    	// Quand un client se connecte, on lui envoie un message
    	socket.emit('messageConnection', 'Vous êtes le connecté numéro = '+idConnection);
    	// On signale aux autres clients qu'il y a un nouveau venu
    	socket.broadcast.emit('messageBroadcast', 'Un autre client vient de se connecter ! ');

    	// Dès qu'on nous donne un pseudo, on le stocke en variable de session
    	socket.on('petit_nouveau', function(pseudo) {
        	socket.pseudo = pseudo;
    	});

    	// Dès qu'on reçoit un "message" (clic sur le bouton), on le note dans la console
    	socket.on('addAttaque', function (coords) {
        	// On récupère le pseudo de celui qui a cliqué dans les variables de session
        	console.log(socket.pseudo+' joue : '+coords.abs+', '+coords.ord);
    	});
    } else {
    	// il y a plus de 2 participants
    	socket.emit('messageConnection', '2 clients deja connectés au serveur...');

    	console.log("Pas plus de 2 connectés à la fois !!!");
    }
});


server.listen(8080);
