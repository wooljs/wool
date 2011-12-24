/*
 * Copyright 2010 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *      
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

var counter = require('counter.js');
var logger = require('cnlogger').logger(module); 
var dispatch = require('dispatch.js').inject(logger);

exports['should delegate call to chain'] = function (test) {
	var c = counter.build();
	
	var x = {url:'/plop.html',method:'GET'};
	var y = {};
	var z = "XX";
	
	var date = function () {
		return z;
	}

	var chain = function (a) {
		c.inc();
		test.ok(true,"chain was called");
		test.equal(a.req, x);
		test.equal(a.res, y);
	}
	
	dispatch.build(chain)(x,y);
	
    test.equal(c.check(), 1);
    test.done();
};

exports['should chain first only'] = function (test) {
	var o = {};
	dispatch.chain([
		{
			valid : function (u) {true;},
			run : function (u) {
				test.ok(true,"First method is called");
				test.strictEqual(u,o);
			}
		},
		{
			valid : function (u) {true;},
			run : function (u) {
				test.ok(false,"Second method should never be called");
			}
		},
		{
			valid : function (u) {true;},
			run : function (u) {
				test.ok(false,"Third method should never be called");
			}
		}
	])(o);
	
    test.done();
};

exports['should chain second only'] = function (test) {
	var o = {};
	dispatch.chain([
		{
			valid : function (u) {false;},
			run : function (u) {
				test.ok(false,"First method should never be called");
			}
		},
		{
			valid : function (u) {true;},
			run : function (u) {
				test.ok(true,"Second method is called");
				test.strictEqual(u,o);
			}
		},
		{
			valid : function (u) {true;},
			run : function (u) {
				test.ok(false,"Third method should never be called");
			}
		}
	])(o);
		
    test.done();
};

exports['should skip first and second change value for third'] = function (test) {
	var o = {};
	var x = {};
	dispatch.chain([
		{
			valid : function (u) {false;},
			run : function (u) {
				test.ok(false,"First method should never be called");
			}
		},
		{
			valid : function (u) {true;},
			run : function (u) {
				test.ok(true,"Second method is called");
				test.strictEqual(u,o);
				return x;
			}
		},
		{
			valid : function (u) {true;},
			run : function (u) {
				test.ok(true,"Third method is called");
				test.strictEqual(u,x);
			}
		}
	])(o);
	
    test.done();
};

var action = function() {}

exports['should always accept filter true'] = function (test) {
	var r = dispatch.rule(true,action);
	test.ok(r.valid());
	test.ok(r.valid('/'));
	test.ok(r.valid('plop'));
	test.done();
}

exports['should use function filter as valid method'] = function (test) {
	var fun = function() {}
	var r = dispatch.rule(fun,action);
	test.equals(r.valid,fun);
	test.done();
}

var test_rx = function (regex) {
	return function (test) {
		var r = dispatch.rule(regex,action);
		test.throws(function () {r.valid()});
		test.throws(function () {r.valid('plop')});
		test.ok(! r.valid({req:{url:'/'}}));
		test.ok(! r.valid({req:{url:'plop'}}));
		test.ok(! r.valid({req:{url:'/plop'}}));
		test.ok(r.valid({req:{url:'/a'}}));
		test.ok(r.valid({req:{url:'/abba'}}));
		test.done();
	}
}
exports['should use regex filter to match u.req.url'] = test_rx(/^\/a/);
exports['should use string filter as regex to match u.req.url'] = test_rx('^\/a');

exports['should fail to match u.req.url if filter object is no regex'] = function (test) {
	test.throws(function () {dispatch.rule({},action)});
	test.done();
}
