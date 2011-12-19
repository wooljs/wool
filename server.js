// Dependency injection

exports.callback = function (fs) {
	var count = 0;
	return function (req, res) {
		count++;
		console.log("call #"+count);
		res.writeHead(200, {'Content-Type': 'text/html'});
		fs.readFile('./static/index.html', function (err, data) {
			if (err) throw err;
			res.end(data);
		});
	}
}
