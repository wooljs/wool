// Dependency injection


exports.callback = function (urlparser, fs) {
	var count = 0;
	return function (req, res) {
		count++;
		var parsed = urlparser(req.url,true);
		console.log("call #%d : ",count,parsed.href);

		var rules = [
			// Case 1: json call
			{
				ok : (parsed.pathname.indexOf('/j/')==0),
				run : function () {
					res.writeHead(200, {'Content-Type': 'text/json'});
					res.end({});
				}
			},
			// Case 2: root file
			{
				ok : parsed.href=="/",
				run : function () {
					return urlparser('/index.html',true);
				}
			},
			// Case 3: static files
			{
				ok : true,
				run : function () {
					res.writeHead(200, {'Content-Type': 'text/html'});
					fs.readFile('./static'+parsed.pathname, function (err, data) {
						if (err) throw err;
						res.end(data);
					});					
				}
			}
		];
		var o;
		while (o = rules.shift()) {
			if (o.ok) {
				if (! (parsed = o.run())) {
					break;
				}
			}
			
		}
	}
}


