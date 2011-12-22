var https = require('https');
var fs = require('fs');
var urlparser = require('url').parse;
var chain = require('chain.js');
var dispatch = require('dispatch.js');
var rules = require('rules.js');
var rest = require('rest.js');
var mime = require('mime');

var port = 8000;
var default_location = '/index.html';

console.log("[%s] Starting Server.",Date());

https.createServer(
	{
		key: fs.readFileSync('server-key.pem'),
		cert: fs.readFileSync('server-cert.pem')
	},
	dispatch.build(
		console,
		Date,
		chain.build([
			rules.rest(rest),
			rules.static(default_location, urlparser, mime.lookup, fs)
		])
	)
).
listen(port);

console.log("[%s] Server is ready.",Date());

/*
fs.readFile('./x', function (err,data) {
	console.dir(err);
})
fs.stat("./static/", function(err, stats) {
	if (err) {
		console.error(err);
	} else {
		console.log("stats.isDirectory()=%s",stats.isDirectory());
	}
});
*/
