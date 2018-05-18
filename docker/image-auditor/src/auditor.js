// adresse et port définis dans intrument-protoocol.js
var protocol = require('./instrument-protocol');
var moment = require('moment');
var instrumentMap = protocol.INSTRUMENT_TO_SOUND;

var net = require('net');
var dgram = require('dgram');
var dgramSocket = dgram.createSocket('udp4');

dgramSocket.bind(protocol.PROTOCOL_PORT, function() {
  console.log("Joining multicast group");
  dgramSocket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

instrumentToSound = protocol.INSTRUMENT_TO_SOUND;
musicians = new Map();

/* 
 * This call back is invoked when a new datagram has arrived.
 */
dgramSocket.on('message', function(msg, source) {
	console.log("Data has arrived: " + msg + ". Source port: " + source.port);
	//json : {"uuid":"bbaf7deb-29a2-4646-9c84-383344125cd6","sound":"ti-ta-ti"} 
	musician = JSON.parse(msg);

	var uuid = musician.uuid;

	if (musicians.has(uuid)) {
		// known musician
		var currentMusician = musicians.get(uuid);
		if (currentMusician.isActive()) {
			ma = new MusicianActivity(currentMusician.instrument, currentMusician.activeSince, moment());	
		} else {
			ma = new MusicianActivity(currentMusician.instrument, moment(), moment());
		}
	} else {
		// unknown musician
		var instrument;
		for (instru of instrumentToSound.keys()) {
			if (instrumentToSound.get(instru) == musician.sound) {
				instrument = instru;
				break;
			}
		}
		ma = new MusicianActivity(instrument, moment(), moment());
	}
	musicians.set(uuid, ma);
});

function MusicianActivity(instrument, activeSince, lastActivity) {
	this.instrument = instrument;
	this.activeSince = activeSince;
	this.lastActivity = lastActivity;

	MusicianActivity.prototype.isActive = function() {
		return (moment().diff(this.lastActivity, 'second') <= 5);
	}
}

function MusicianData(uuid, instrument, activeSince) {
	this.uuid = uuid;
	this.instrument = instrument;
	this.activeSince = activeSince;
}


var server = net.createServer();

server.on('connection', callbackFunctionToCallWhenNewClientHasArrived);

server.listen(protocol.PROTOCOL_TCP_PORT, "0.0.0.0");

function callbackFunctionToCallWhenNewClientHasArrived(socket) {
	var musiciansArray =  new Array();
	console.log(musicians.keys());
	for (musician of musicians.keys()) {
		var mu = musicians.get(musician);
		if (mu.isActive()) {
			musiciansArray.push(new MusicianData(musician, mu.instrument, mu.activeSince));
		} else {
			musicians.delete(musician);
		}
	}
    socket.write(JSON.stringify(musiciansArray));
	socket.end();
}
