"use strict";

var fs = require("fs");
var path = require("path");
var AirTunesServer = require("nodetunes");
var airtunes = require("airtunes");
const { exec } = require('child_process');

var config = JSON.parse(fs.readFileSync("/home/pi/airplay/config.json"));
var server = new AirTunesServer({ serverName : config.groupName });
var endpoints = config.endpoints;
var bedroomHost = "10.0.1.15";
var devices;
var device2;
var currentStream;
var currentStream2;

server.on("clientConnected", function(stream) {
	  console.log("clientConnected");
	  exec('onkyo volume=50');
	  exec('onkyo source=aux1');
	  devices = [];
	  endpoints.forEach(function(host) {
		      devices.push(airtunes.add(host));
		    });
	  currentStream = stream;
	  stream.pipe(airtunes);
});

server.on("clientDisconnected", function() {
	  console.log("clientDisconnected");
	  exec('onkyo source=cbl');
	  exec('onkyo volume=20');
	  currentStream.unpipe();
	  airtunes.stopAll(function() {
		      console.log("All devices stopped")
		    });
});

server.on("metadataChange", function(metadata) {
	  console.log("Now playing \"" + metadata.minm + "\" by " + metadata.asar + " from \"" + metadata.asal + "\"");
});

server.on("volumeChange", function(volume) {
	  volume = (volume + 30) / 30 * 100
	  console.log("volumeChange " + volume);
	  devices.forEach(function(device) {
		      device.setVolume(volume);
		    });
});

server.start();


//Hack because Bedroom Airport Express doesn't broadcast mDNS record
var server2 = new AirTunesServer({ serverName : "Bedroom" });
server2.on("clientConnected", function(stream) {
	  console.log("clientConnected2");
	  device2 = airtunes.add(bedroomHost);
	  currentStream2 = stream;
	  stream.pipe(airtunes);
});

server2.on("clientDisconnected", function() {
	  console.log("clientDisconnected2");
	  currentStream2.unpipe();
	  airtunes.stopAll(function() {
		      console.log("All devices2 stopped")
		    });
});

server2.on("metadataChange", function(metadata) {
	  console.log("Now playing2 \"" + metadata.minm + "\" by " + metadata.asar + " from \"" + metadata.asal + "\"");
});

server2.on("volumeChange", function(volume) {
	  volume = (volume + 30) / 30 * 100
	  console.log("volumeChange2 " + volume);
	  device2.setVolume(volume);
});
//server2.start()

console.log(config.groupName + " started");
//console.log("Bedroom started");

