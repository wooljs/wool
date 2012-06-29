/*
 * Copyright 2012 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *      
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

var counter = require('../lib/counter.js');
var verifier = require('../lib/verifier.js');

exports['should fail when a call is missing'] = function (test) {
	// GIVEN
	var c = counter();
	
	var _b = [true,false,true];
	var _t = ['u was expected 1 but was called 1','v was expected 1 but was called 0','w was expected 1 but was called 1'];
	var stub = {
		ok: function(b,t) {
			test.equal(b,_b[c.check()]);
			test.equal(t,_t[c.check()]);
			c.inc();
		}
	};
	var verify = verifier(stub);
	
	var _u={}, _v={}, _w={};
	var f_u = verify.add('u',function(u) {test.strictEqual(u,_u)});
	var f_v = verify.add('v',function(v) {test.strictEqual(v,_v)});
	var f_w = verify.add('w',function(w) {test.strictEqual(w,_w)});
	
	// WHEN
	f_u(_u);
	f_w(_w);
	
	verify.check();
	
	// THEN
	test.expect(8);
	test.done();
}

exports['should fail if awaited multiple call is missing'] = function (test) {
	// GIVEN
	var c = counter();
	
	var _b = [true,true,false];
	var _t = ['u was expected 1 but was called 1','v was expected 1 but was called 1','w was expected 3 but was called 2'];
	var stub = {
		ok: function(b,t) {
			test.equal(b,_b[c.check()]);
			test.equal(t,_t[c.check()]);
			c.inc();
		}
	};
	var verify = verifier(stub);
	
	var _u={}, _v={}, _w={};
	var f_u = verify.add('u',function(u) {test.strictEqual(u,_u)});
	var f_v = verify.add('v',function(v) {test.strictEqual(v,_v)});
	var f_w = verify.add('w',function(w) {test.strictEqual(w,_w)},3);
	
	// WHEN
	f_u(_u);
	f_v(_v);
	f_w(_w);
	f_w(_w);
	
	verify.check();
	
	// THEN
	test.expect(10);
	test.done();
}

exports['should check all single call'] = function (test) {
	// GIVEN
	var c = counter();
	
	var _b = [true,true,true];
	var _t = ['u was expected 1 but was called 1','v was expected 1 but was called 1','w was expected 1 but was called 1'];
	var stub = {
		ok: function(b,t) {
			test.equal(b,_b[c.check()]);
			test.equal(t,_t[c.check()]);
			c.inc();
		}
	};
	var verify = verifier(stub);
	
	var _u={}, _v={}, _w={};
	var f_u = verify.add('u',function(u) {test.strictEqual(u,_u)});
	var f_v = verify.add('v',function(v) {test.strictEqual(v,_v)});
	var f_w = verify.add('w',function(w) {test.strictEqual(w,_w)});
	
	// WHEN
	f_u(_u);
	f_v(_v);
	f_w(_w);
	
	verify.check();
	
	// THEN
	test.expect(9);
	test.done();
}
exports['should check all multiple call'] = function (test) {
	// GIVEN
	var c = counter();
	
	var _b = [true,true,true];
	var _t = ['u was expected 2 but was called 2','v was expected 3 but was called 3','w was expected 1 but was called 1'];
	var stub = {
		ok: function(b,t) {
			test.equal(b,_b[c.check()]);
			test.equal(t,_t[c.check()]);
			c.inc();
		}
	};
	var verify = verifier(stub);
	
	var _u={}, _v={}, _w={};
	var f_u = verify.add('u',function(u) {test.strictEqual(u,_u)},2);
	var f_v = verify.add('v',function(v) {test.strictEqual(v,_v)},3);
	var f_w = verify.add('w',function(w) {test.strictEqual(w,_w)},1);
	
	// WHEN
	f_u(_u);
	f_u(_u);
	f_v(_v);
	f_v(_v);
	f_v(_v);
	f_w(_w);
	
	verify.check();
	
	// THEN
	test.expect(12);
	test.done();
}
