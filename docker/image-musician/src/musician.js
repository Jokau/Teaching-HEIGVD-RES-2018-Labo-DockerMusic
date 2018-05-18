// instruments, adresse et port définis dans intrument-protoocol.js
var protocol = require('./instrument-protocol');
var uuid = require('uuid');

// argument de l'appel = type d'instrument
var type = process.argv[2];

var instrumentMap = protocol.INSTRUMENT_TO_SOUND;

if (!(instrumentMap.has(type))) {
	console.log("ERROR: not a valid instrument name");
	return;
}

// UDP datagram
var dgram = require('dgram');
var dgramSocket = dgram.createSocket('udp4');

/*
 * Musician class
 * 
 */
function Musician(type) {

	this.uuid = uuid(); 

	var sound = instrumentMap.get(type);

	Musician.prototype.update = function() {
		var data = {
			uuid : this.uuid,
			sound : sound
		};

		var payload = JSON.stringify(data);
		var message = new Buffer(payload);
		dgramSocket.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function(err, bytes) {
			console.log("Sending payload: " + payload + " via port " + dgramSocket.address().port);
		});
	}

	/*
	 *	send every 1s
	 */
	setInterval(this.update.bind(this), 1000);
}

var t1 = new Musician(type);