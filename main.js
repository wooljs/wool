var https = require('https');
var fs = require('fs');

var options = {
	key: fs.readFileSync('server-key.pem'),
	cert: fs.readFileSync('server-cert.pem')
};

var count = 0;

https.createServer(options, function (req, res) {
	count++;
	console.log("call #"+count);
	res.writeHead(200, {'Content-Type': 'text/html'});
	fs.readFile('./static/index.html', function (err, data) {
		if (err) throw err;
		res.end(data);
	});
}).listen(8000);
