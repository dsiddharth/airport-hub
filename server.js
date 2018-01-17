"use strict";

var fs = require("fs");
var path = require("path");
var AirTunesServer = require("nodetunes");
var airtunes = require("airtunes");
const { exec } = require('child_process');

var config = JSON.parse(fs.readFileSync("/home/pi/airplay/config.json"));
var server = new AirTunesServer({ serverName : config.groupName });
var endpoints = config.endpoints;
var devices;
var currentStream;

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
  exec('onkyo source=cd');
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

console.log(config.groupName + " started");

