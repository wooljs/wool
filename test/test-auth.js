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

var verifier = require('../lib/verifier.js');

var _http_status = {};
var http_status = function(v){if (! _http_status.hasOwnProperty(v)) { http_status.test.ok(false, 'No mock was defined for '+v+' status');} else return _http_status[v];}

var _urlparser = {};
var urlparser = function(u){ return _urlparser.run(u);}

var auth = require('../lib/auth.js')(http_status, urlparser);

function test_method_unauthentified_call_on_resource(tested_method, tested_url) {
	exports['should refuse un-authentified call with no header '+tested_method+' on '+tested_url] = function (test) {
		http_status.test = test;
		var verify = verifier(test);
		
		// GIVEN
		// should refuse even with systematic acceptation
		var biz={auth:function(a,b,c) {c(true);}}

		// under test
		var auth_u = auth.build(biz,'/r/',function(){});

		_http_status[401] = verify.add('http status 401 handler', function (res) {test.strictEqual(res,s);res.writeHead(401);});
		var q = {method: tested_method, url: tested_url, headers: {}}		
		var s = {writeHead : verify.add('receive 401 code',function(code) {test.equal(code,401);})};
		
		// WHEN
		auth_u(q,s);
		
		// THEN
		verify.check();
		test.expect(4);
		test.done();
		delete _urlparser.run;
		delete _http_status[401];
	};
	exports['should refuse un-authentified call with invalid header '+tested_method+' on '+tested_url] = function (test) {
		http_status.test = test;
		var verify = verifier(test);
		
		// GIVEN
		var invalid_session_id = 'XX';
		var biz={auth: verify.add('biz.auth()',function(v,p,c) {test.strictEqual(v,invalid_session_id); c(false);})};
		
		// under test
		var auth_u = auth.build(biz,'/r/',function(){});
		
		_http_status[401] = verify.add('http status 401 handler', function (res) {test.strictEqual(res,s);res.writeHead(401);});
		_urlparser.run = verify.add('urlparser()', function(v) { test.strictEqual(v, tested_url.substring('/r/'.length)); return {} } );
		var q = {method: tested_method, url: tested_url, headers: {'X-Token':invalid_session_id}};
		var s = {writeHead : verify.add('receive 401 code',function(code) {test.equal(code,401);})};
		
		// WHEN
		auth_u(q,s);
		
		// THEN
		verify.check();
		test.expect(8);
		test.done();
		delete _urlparser.run;
		delete _http_status[401];
	};
}

['HEAD', 'GET', 'PUT', 'DELETE'].forEach(function(m) {	
	test_method_unauthentified_call_on_resource(m,'/r/');
});

function test_all_method_unauthentified_call_on_resource(url) {
	['HEAD', 'GET', 'POST', 'PUT', 'DELETE'].forEach(function(m) {	
		test_method_unauthentified_call_on_resource(m, url);
	});	
}

test_all_method_unauthentified_call_on_resource('/r/42');
test_all_method_unauthentified_call_on_resource('/r/a/42');
test_all_method_unauthentified_call_on_resource('/r/42?a=n');

exports['should accept valid tentative of authentification with POST on login_url'] = function (test) {
	var verify = verifier(test);
	
	// GIVEN
	http_status.test = test;
	var session_id = "XXXX";
	var biz = { login: verify.add('biz.login',function (o, c) { test.deepEqual(o,{l:'x',p:'y'}); c(undefined,session_id); }) };
	var q,s;	
	_http_status[201] = verify.add('http status 201 handler',function (res,t,v) {test.strictEqual(res,s);res.writeHead(201, {'Content-Type': t});res.end(v)});
	
	// under test
	var auth_u = auth.build(biz,'/r/',function(){});
	
	var body = '{"l":"x","p":"y"}';

	q = { method:'POST', url: '/r/', headers: {},
		on: function (d,c) { var o={
			data: function() { c(body); },
			end: function() { c(); } }; o[d](); }
	};
	s = {
		writeHead : verify.add('response write header' ,function(code,t) {test.equal(code,201);test.deepEqual(t,{'Content-Type': 'application/json'})}),
		end: verify.add('response end', function(data) {test.equal(data,'"'+session_id+'"');})
	};
	
	// WHEN
	auth_u(q,s);
	
	// THEN
	verify.check();
	test.expect(9);
	test.done();
	delete _urlparser.run;
	delete _http_status[201];
};

exports['should refuse invalid tentative of authentification with POST on login_url'] = function (test) {
	var verify = verifier(test);
	
	// GIVEN
	http_status.test = test;
	var session_id = "XXXX";
	var biz = { login: verify.add('biz.login',function (o, cb) {test.ok(typeof o['l'] === 'undefined');test.ok(typeof o['p'] === 'undefined'); cb({status:401}); }) };
	var q,s;	
	_http_status[401] = verify.add('http status 401 handler',function (res,t) {test.strictEqual(res,s);res.writeHead(401, {'Content-Type': t});res.end()});
	
	// under test
	var auth_u = auth.build(biz,'/r/',function(){});
	
	var body = '{"x":"x","u":"y"}';

	q = { method:'POST', url: '/r/', headers: {},
		on: function (d,c) { var o={
			data: function() { c(body); },
			end: function() { c(); } }; o[d](); }
	};
	s = {
		writeHead : verify.add('response write header' ,function(code,t) {test.equal(code,401);}),
		end: verify.add('response end', function(data) {test.notEqual(data,'"'+session_id+'"');})
	};
	
	// WHEN
	auth_u(q,s);
	
	// THEN
	verify.check();
	test.expect(9);
	test.done();
	delete _urlparser.run;
	delete _http_status[401];
};


function test_method_authentified_call_on_unauthorized_resource(tested_method, tested_url, tested_parsed) {
	exports['should refuse authentified '+tested_method+' call on unauthorized resource '+tested_url] = function (test) {
		http_status.test = test;
		var verify = verifier(test);

		// GIVEN
		var tested_url_root = '/r/'
		var valid_session_id = 'XX';

		var biz = {
			auth: verify.add('biz.auth()',function(v,u,c) {test.strictEqual(v,valid_session_id); test.strictEqual(u,tested_parsed.pathname); c(false);})
		};
		
		_http_status[401] = verify.add('http status 401 handler', function (res) {test.strictEqual(res,s);res.writeHead(401);});
		
		_urlparser.run = verify.add('urlparser()', function(v) { test.equal(v, tested_parsed.href); return tested_parsed } );
		
		var q = {method: tested_method, url: tested_url, headers: {'X-Token': valid_session_id}};
		var s = {writeHead : verify.add('receive 401 code',function(code) {test.equal(code,401);})};
		
		// under test
		var auth_u = auth.build(biz,'/r/',function(){});

		// WHEN
		auth_u(q,s);
		
		// THEN
		verify.check();
		test.expect(9);
		test.done();
		delete _http_status[401];
	};
}

function test_all_method_authentified_call_on_unauthorized_resource(url, parsed) {
	['HEAD', 'GET', 'POST', 'PUT', 'DELETE'].forEach(function(m) {	
		test_method_authentified_call_on_unauthorized_resource(m, url, parsed);
	});	
}
test_all_method_authentified_call_on_unauthorized_resource('/r/a/', {href: 'a/', search: '', query: {}, pathname: 'a/'});
test_all_method_authentified_call_on_unauthorized_resource('/r/a/42', {href: 'a/42', search: '', query: {}, pathname: 'a/42'});
test_all_method_authentified_call_on_unauthorized_resource('/r/a/?a=n', {href: 'a/?a=n', search: '?a=n', query: {a:'n'}, pathname: 'a/'});


function test_all_method_authentified_call_on_authorized_resource(tested_url, tested_parsed) {
	['HEAD', 'GET', 'POST', 'PUT', 'DELETE'].forEach(function(tested_method) {
		exports['should accept authentified '+tested_method+' call on authorized resource '+tested_url] = function (test) {
			http_status.test = test;
			var verify = verifier(test);

			// GIVEN
			var tested_url_root = '/r/'
			var valid_session_id = 'XX';

			var biz = {
				auth: verify.add('biz.auth()',function(v,u,c) {test.strictEqual(v,valid_session_id); test.strictEqual(u,tested_parsed.pathname); c(true);})
			};
			
			_urlparser.run = verify.add('urlparser()', function(v) { test.equal(v, tested_parsed.href); return tested_parsed } );
			
			var q = {method: tested_method, url: tested_url, headers: {'X-Token': valid_session_id}};
			var s = {writeHead : function() {test.ok(false,'mock handler should not call here');} };
			
			// under test
			var auth_u = auth.build(biz,'/r/',verify.add('handler is called',function(req,res){test.strictEqual(req,q);test.strictEqual(res,s);}));

			// WHEN
			auth_u(q,s);
			
			// THEN
			verify.check();
			test.expect(8);
			test.done();
		}
	});
}

test_all_method_authentified_call_on_authorized_resource('/r/x/',{href: 'x/', search: '', query: {}, pathname: 'x/'});
