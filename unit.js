var assert = require('assert')

// run unit tests

var server = require('./server');

(function () {
	var err = 0;
	var data = "fake data";
	var fs = {
		readFile : function() {
			var args = Array.prototype.slice.call(arguments);
			assert.equal(2, args.length);
			assert.equal('./static/index.html', args[0]);
			args[1](err,data)
		}
	};
	var req = {};
	var res = {
		writeHead : function(){
			var args = Array.prototype.slice.call(arguments);
			assert.equal(2,args.length);
			assert.equal(200, args[0]);
			assert.equal('text/html', args[1]['Content-Type']);
		},
		end : function (d) {
			assert.equal(data,d);
		}
	};

	var callback = server.callback(fs);

	callback(req,res);
})()
