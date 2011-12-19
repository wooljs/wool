var https = require('https');
var fs = require('fs');
var parse = require('url').parse;
var server = require('./server');

https.createServer(
	{
		key: fs.readFileSync('server-key.pem'),
		cert: fs.readFileSync('server-cert.pem')
	},
	server.callback(parse,fs)
).
listen(8000);
