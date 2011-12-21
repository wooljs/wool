var dispatch = require('dispatch.js');

exports['should play rules'] = function (test) {
	var count = 0;
	
	var x = {url:'/plop.html',method:'GET'};
	var y = {};
	
	var rules = [];
	var play = function (a,b) {
		count++;
		test.ok(true,"play was called");
		test.equal(a.req, x);
		test.equal(a.res, y);
		test.equal(b, rules);
	}
	
	dispatch.build(play, rules)(x,y);
	
    test.equal(count, 1);
    test.done();
};

