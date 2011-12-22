var dispatch = require('dispatch.js');

exports['should delegate call to chain'] = function (test) {
	var count = 0;
	
	var x = {url:'/plop.html',method:'GET'};
	var y = {};
	var z = "XX";
	
	var date = function () {
		return z;
	}
	
	var logger = {
		log:function(a,b,c,d){
			test.equal(a,"[%s] %s %s");
			test.strictEqual(b,z);
			test.strictEqual(c,x.method);
			test.strictEqual(d,x.url);
		}
	}
	
	var chain = function (a) {
		count++;
		test.ok(true,"chain was called");
		test.equal(a.req, x);
		test.equal(a.res, y);
	}
	
	dispatch.build(logger, date, chain)(x,y);
	
    test.equal(count, 1);
    test.done();
};

