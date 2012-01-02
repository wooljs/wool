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
var filter = require('filter.js').inject(logger).build('url');

exports['should always accept filter true'] = function (test) {
	var f = filter(true);
	test.ok(f(), 'could not filter nothing');
	test.ok(f('/'), 'could not filter /');
	test.ok(f('plop'), 'could not filter plop');
	test.ok(f('+qf%??df'), 'could not filter +qf%??df');
	test.done();
}

exports['should use function to filter req.url'] = function (test) {
	var c = counter.build();
	var x = {}
	var fun = function(o) {c.inc();return o;}
	var y = filter(fun)({url:x});
	test.strictEqual(x,y);
	test.equal(c.check(),1);
	test.done();
}

exports['should use string filter as equal req.url'] = function (test) {
	var f = filter('/a');
	test.throws(function () {f()});
	test.ok(! f({url:'/'}));
	test.ok(! f({url:'plop'}));
	test.ok(! f({url:'/plop'}));
	test.ok(f({url:'/a'}));
	test.ok(!f({url:'/abba'}));
	test.done();
}

exports['should use regex filter to match req.url'] = function (test) {
	var f = filter(/^\/a/);
	test.throws(function () {f()});
	test.throws(function () {f('plop')});
	test.ok(! f({url:'/'}));
	test.ok(! f({url:'plop'}));
	test.ok(! f({url:'/plop'}));
	test.ok(f({url:'/a'}));
	test.ok(f({url:'/abba'}));
	test.done();
}

exports['should fail if filter is integer'] = function (test) {
	test.throws(function () {filter(42)});
	test.done();
}

exports['should accept if any filter is ok on req.url'] = function (test) {
	var c_call = counter.build();

	test.ok(filter([
		function() {c_call.inc();return false;},
		function() {c_call.inc();return true;},
		function() {
			test.ok(false,"Should never be called");
		}
	])({}));
	
	test.equals(c_call.check(),2);
	
	test.ok(filter([
		function() {return false;},
		'^pl',
		true,
		/op$/
	])({url:'plop'}));	

	test.ok(!filter([
		false,
		function() {return false;},
		/u/
	])({url:'xx'}));


	test.throws(function () {filter([true, 42])});
	
	test.done();
}

exports['should tempt to match req if filter object is {x: <regex> }'] = function (test) {
	var f = filter({'x' : /\.html$/, 'y': 'PLOP'});
	test.ok(! f({x:'/'}));
	test.ok(! f({y:'plop'}));
	test.ok(! f({x: 'xxx', y:'PLOP'}));
	test.ok(! f({x: 'test/plip.html', y:'xxx'}));
	test.ok(f({x : '/index.html', y:'PLOP'}));
	test.ok(f({x : '/index.html', y:'PLOP', z: 'AAAA'}));
	test.done();
}

/*
exports['should '] = function (test) {
	var treat_object = _build_treat_object();
	
	treat_object();
	
}
 */
