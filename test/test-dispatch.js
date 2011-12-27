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

exports['should chain first only'] = function (test) {
	var c_1st_valid = counter.build();
	var c_1st_run = counter.build();

	var req = {};
	var res = {};
	dispatch.chain([
		{
			valid : function (r) {
				c_1st_valid.inc();
				return true;
			},
			run : function (r, s) {
				c_1st_run.inc();
				test.ok(true,"First method is called");
				test.strictEqual(req,r);
				test.strictEqual(res,s);
			}
		},
		{
			valid : function (r) {
				test.ok(false,"Second method should never be called");
				return true;
			},
			run : function (r,s) {
				test.ok(false,"Second method should never be called");
			}
		},
		{
			valid : function (r) {
				test.ok(false,"Third method should never be called");
				true;
			},
			run : function (r,s) {
				test.ok(false,"Third method should never be called");
			}
		}
	])(req,res);

	test.equal(c_1st_run.check(), 1);
	test.equal(c_1st_valid.check(), 1);
    test.done();
};

exports['should chain second only'] = function (test) {
	var c_1st_valid = counter.build();
	var c_2nd_valid = counter.build();
	var c_2nd_run = counter.build();
	
	var req = {};
	var res = {};
	dispatch.chain([
		{
			valid : function (r) {
				c_1st_valid.inc();
				return false;
			},
			run : function (r,s) {
				test.ok(false,"First method should never be called");
			}
		},
		{
			valid : function (r) {
				c_2nd_valid.inc();
				return true;
			},
			run : function (r,s) {
				c_2nd_run.inc();
				test.ok(true,"Second method is called");
				test.strictEqual(req,r);
				test.strictEqual(res,s);
				return {};
			}
		},
		{
			valid : function (r) {
				test.ok(false,"Third method should never be called");
				return true;
			},
			run : function (r,s) {
				test.ok(false,"Third method should never be called");
			}
		}
	])(req,res);
		
	test.equal(c_1st_valid.check(), 1);
	test.equal(c_2nd_valid.check(), 1);
	test.equal(c_2nd_run.check(), 1);
    test.done();
};

var action = function() {}

exports['should always accept filter true'] = function (test) {
	var f = dispatch.filter(true);
	test.ok(f());
	test.ok(f('/'));
	test.ok(f('plop'));
	test.done();
}

exports['should use function to filter'] = function (test) {
	var fun = function() {}
	var f = dispatch.filter(fun);
	test.equals(f,fun);
	test.done();
}

var test_rx = function (regex) {
	return function (test) {
		var f = dispatch.filter(regex);
		test.throws(function () {f.valid()});
		test.throws(function () {f.valid('plop')});
		test.ok(! f({url:'/'}));
		test.ok(! f({url:'plop'}));
		test.ok(! f({url:'/plop'}));
		test.ok(f({url:'/a'}));
		test.ok(f({url:'/abba'}));
		test.done();
	}
}
exports['should use regex filter to match req.url'] = test_rx(/^\/a/);
exports['should use string filter as regex to match req.url'] = test_rx('^\/a');
exports['should fail to match req.url if filter object is no regex'] = function (test) {
	test.throws(function () {dispatch.filter({})});
	test.done();
}

exports['should pipe array definition to filter'] = function (test) {
	var c_call = counter.build();

	dispatch.filter([
		function() {c_call.inc();return true;},
		function() {c_call.inc();return true;},
		function() {c_call.inc();return true;},
		function() {c_call.inc();return false;},
		function() {c_call.inc();return false;}
	])();
	
	test.equals(c_call.check(),4);
	
	test.ok(dispatch.filter([
		function() {return true;},
		'^pl',
		true,
		/op$/
	])({url:'plop'}));	

	test.throws(function () {dispatch.filter([
		true,
		{}
	])});
	
	test.done();
}

