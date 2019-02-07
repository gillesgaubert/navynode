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
var listeConnectes=[];
var nom="";
var messBroad;
// flag pour savoir a qui c est le tour :
// au debut id 0 joue et pas id 1
var tourId=[true,false];


console.log(tourId[0]+"  "+tourId[1]);

io.sockets.on('connection', function (socket, pseudo) {
    // on verifie le nombre de connection
    if (idConnection<2) {
    	
    	console.log('idConnection = '+idConnection);
    	// Quand un client se connecte, on lui envoie un message
    	socket.emit('messageConnection', 'idConnection = '+idConnection);

    	// Dès qu'on nous donne un pseudo, on le stocke en variable de session
    	socket.on('petit_nouveau', function(pseudo) {
        	messBroad="";
            socket.pseudo = pseudo;
            listeConnectes[idConnection]=pseudo;
            console.log(listeConnectes);
            /*if (idConnection==0) {socket.monTour=true;}
            if (idConnection==1) {socket.monTour=false;}*/
            socket.monId=idConnection;

            for (var i=0;i<listeConnectes.length;i++) {
                console.log("element "+i+" = "+listeConnectes[i]);
                messBroad+=listeConnectes[i]+" ";
            }
            
            // ajoute info sur tour de jouer
            if (socket.monTour) messBroad+=", a vous de jouer !";
            else messBroad+=", pas à vous de jouer !";

            console.log(messBroad);
            
            //socket.emit('messageBroadcast', "vous :"+pseudo+" etes bien connectés");
            socket.emit('messageBroadcast', "Sont connectés : "+messBroad);
            // On signale a l autre client qu'il y a un nouveau venu
            socket.broadcast.emit('messageBroadcast', "Sont connectés : "+messBroad);
            
            idConnection++;
    	});

    	// Dès qu'on reçoit une "attaque" (clic sur le bouton), on le note dans la console
    	socket.on('addAttaque', function (coords) {
        	console.log("socket.monId = "+socket.monId);
        	if ((tourId[socket.monId]) && (listeConnectes.length==2)) {
        		// c est bien ton tour donc c cool
        		// On récupère le pseudo de celui qui a cliqué dans les variables de session
        		console.log(socket.pseudo+' joue : '+coords.abs+', '+coords.ord);
        		
        		// on inverse les roles
        		if (tourId[0]) {
        			tourId[0]=false;
        			tourId[1]=true;
        		} else {
        			tourId[0]=true;
        			tourId[1]=false;
        		}
    		} else {
    			// c est pas a toi de jouer donc je t envoie bouler
    			console.log(socket.pseudo+ ' a joué mais ce n etait pas le moment !');
    		}
    	});
    } else {
    	// il y a plus de 2 participants
        console.log("Pas plus de 2 connectés à la fois !!!");
    	socket.emit('messageConnection', '2 clients deja connectés au serveur...');
    }
});

server.listen(8080);
