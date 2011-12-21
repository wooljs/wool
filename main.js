var https = require('https');
var fs = require('fs');
var urlparser = require('url').parse;
var play = require('chain.js').play;
var dispatch = require('dispatch.js');
var rules = require('rules.js');

var port = 8000;

default_location = '/index.html';

https.createServer(
	{
		key: fs.readFileSync('server-key.pem'),
		cert: fs.readFileSync('server-cert.pem')
	},
	dispatch.build(play, rules.inject(default_location, urlparser, fs.readFile))
).
listen(port);
