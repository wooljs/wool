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

var _filter;
var filter = function (x) {
	return _filter(x);
}

var dispatch = require('dispatch.js').inject(logger, filter);

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
				test.ok(true,"First function is called");
				test.strictEqual(req,r);
				test.strictEqual(res,s);
			}
		},
		{
			valid : function (r) {
				test.ok(false,"Second function should never be called");
				return true;
			},
			run : function (r,s) {
				test.ok(false,"Second function should never be called");
			}
		},
		{
			valid : function (r) {
				test.ok(false,"Third function should never be called");
				true;
			},
			run : function (r,s) {
				test.ok(false,"Third function should never be called");
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
				test.ok(false,"First function should never be called");
			}
		},
		{
			valid : function (r) {
				c_2nd_valid.inc();
				return true;
			},
			run : function (r,s) {
				c_2nd_run.inc();
				test.ok(true,"Second function is called");
				test.strictEqual(req,r);
				test.strictEqual(res,s);
				return {};
			}
		},
		{
			valid : function (r) {
				test.ok(false,"Third function should never be called");
				return true;
			},
			run : function (r,s) {
				test.ok(false,"Third function should never be called");
			}
		}
	])(req,res);
		
	test.equal(c_1st_valid.check(), 1);
	test.equal(c_2nd_valid.check(), 1);
	test.equal(c_2nd_run.check(), 1);
    test.done();
};

var action = function() {}

exports['should build rule'] = function (test) {
	var f = function() {}
	var rule1 = dispatch.rule(f, action);
	test.strictEqual(rule1.valid, f);
	test.strictEqual(rule1.run, action);
	
	
	var c_filter = counter.build();
	var def = "xx";
	var res = function() {}
	_filter = function (x) {
		c_filter.inc();
		test.equal(def, x);
		return res;
	}

	var rule2 = dispatch.rule(def, action);
	test.strictEqual(rule2.valid, res);
	test.strictEqual(rule2.run, action);
	test.equal(c_filter.check(), 1);
	test.done();
}
