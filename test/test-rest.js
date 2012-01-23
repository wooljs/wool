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

var verifier = require('verifier.js');

var _http_status = {};
var http_status = function(v){if (! _http_status.hasOwnProperty(v)) { http_status.test.ok(false, 'No mock was defined for '+v+' status');} else return _http_status[v];}

var _urlparser = {};
var urlparser = function(u){ return _urlparser.run(u);}

var rest = require('rest.js').inject(http_status, urlparser);

var _mime_type_json = 'application/json';

exports['should treat GET /r/x/{id} and return 200 with header and data'] = function (test) {
	var verify = verifier.build(test);
	http_status.test = test;
	
	// GIVEN
	var _d = '{"a":"bbb","c":"dddd"}';

	var _mapping = {'x':'plop'};
	var _biz = { on: verify.add('biz.on()', function(type) {
		test.equal(type, 'plop');
		return { getOne: verify.add('biz.getOne()',function (id, cb) { test.equal(id, 42); cb(_d);}) };
	}) };
	
	var _u = '/r/x/42', _sub_u = 'x/42'
	_urlparser.run = verify.add('urlparser()',function (u) {test.equal(u, _sub_u); return {href:_sub_u, search:'', query:{}, pathname:_sub_u}; });

	// under test
	var rest_u = rest.build('/r/' ,_biz, _mapping);
	
	var q,s;
	var _t = _mime_type_json;
	
	_http_status[200] = verify.add('http status 200 handler',function (res, type, data, headers) {
		test.strictEqual(res,s); test.strictEqual(type,_t); test.strictEqual(data,_d);test.equal(headers,undefined);
		headers = headers || {}; headers['Content-Type']= type; res.writeHead(200, headers);res.end(data);
	});

	q = { method:'GET', url: _u, headers: {} };
	s = { 
		writeHead : verify.add('response write header' ,function(code,t) {test.equal(code,200);test.deepEqual(t,{'Content-Type': _mime_type_json})}),
		end: verify.add('response end', function(data) {test.equal(data,_d);})
	};
	
	// WHEN
	rest_u(q,s);
	
	// THEN
	verify.check();
	test.expect(16);
	test.done();
	delete _urlparser.run;
	delete _http_status[200];
};

exports['should treat GET /r/x/ and return 200 with header and data'] = function (test) {
	var verify = verifier.build(test);
	http_status.test = test;
	
	// GIVEN
	var _d = '[{"a":"bbb","c":"dddd"},{"a":"bbb","c":"dddd"},{"a":"bbb","c":"dddd"},{"a":"bbb","c":"dddd"}]';

	var _crit = {};
	var _mapping = {'x':'plop'};
	var _biz = { on: verify.add('biz.on()', function(type) {
		test.equal(type, 'plop');
		return { getAll: verify.add('biz.getAll()',function (crit, cb) { test.deepEqual(crit, _crit); cb(_d);}) };
	}) };
	
	var _u = '/r/x/', _sub_u = 'x/'
	_urlparser.run = verify.add('urlparser()',function (u) {test.equal(u, _sub_u); return {href:_sub_u, search:'', query:{}, pathname:_sub_u}; });

	// under test
	var rest_u = rest.build('/r/' ,_biz, _mapping);
	
	var q,s;
	var _t = _mime_type_json;
	
	_http_status[200] = verify.add('http status 200 handler',function (res, type, data, headers) {
		test.strictEqual(res,s); test.strictEqual(type,_t); test.strictEqual(data,_d);test.equal(headers,undefined);
		headers = headers || {}; headers['Content-Type']= type; res.writeHead(200, headers);res.end(data);
	});

	q = { method:'GET', url: _u, headers: {} };
	s = { 
		writeHead : verify.add('response write header' ,function(code,t) {test.equal(code,200);test.deepEqual(t,{'Content-Type': _mime_type_json})}),
		end: verify.add('response end', function(data) {test.equal(data,_d);})
	};
	
	// WHEN
	rest_u(q,s);
	
	// THEN
	verify.check();
	test.expect(16);
	test.done();
	delete _urlparser.run;
	delete _http_status[200];
}

exports['should treat GET /r/x/?a=12&b=plop and return 200 with header and data'] = function (test) {
	var verify = verifier.build(test);
	http_status.test = test;
	
	// GIVEN
	var _d = '[{"a":"bbb","c":"dddd"},{"a":"bbb","c":"dddd"},{"a":"bbb","c":"dddd"}]';

	var _crit = {a:12,b:'plop'};
	var _mapping = {'x':'plop'};
	var _biz = { on: verify.add('biz.on()', function(type) {
		test.equal(type, 'plop');
		return { getAll: verify.add('biz.getAll()',function (crit,cb) { test.deepEqual(crit, _crit); cb(_d);}) };
	}) };
	
	var _u = '/r/x/?a=12&b=plop', _sub_u = 'x/?a=12&b=plop', _sub_u_pathname = 'x/';
	_urlparser.run = verify.add('urlparser()',function (u) {test.equal(u, _sub_u); return {href:_sub_u, search:'?a=12&b=plop', query:{a:12,b:'plop'}, pathname:_sub_u_pathname}; });

	// under test
	var rest_u = rest.build('/r/' ,_biz, _mapping);
	
	var q,s;
	var _t = _mime_type_json;
	
	_http_status[200] = verify.add('http status 200 handler',function (res, type, data, headers) {
		test.strictEqual(res,s); test.strictEqual(type,_t); test.strictEqual(data,_d);test.equal(headers,undefined);
		headers = headers || {}; headers['Content-Type']= type; res.writeHead(200, headers);res.end(data);
	});

	q = { method:'GET', url: _u, headers: {} };
	s = { 
		writeHead : verify.add('response write header' ,function(code,t) {test.equal(code,200);test.deepEqual(t,{'Content-Type': _mime_type_json})}),
		end: verify.add('response end', function(data) {test.equal(data,_d);})
	};
	
	// WHEN
	rest_u(q,s);
	
	// THEN
	verify.check();
	test.expect(16);
	test.done();
	delete _urlparser.run;
	delete _http_status[200];
	
}

/*
exports['should treat HEAD /r/x/{id} and return 200 with header but no data'] = function (test) {test.ok(false);test.done();}
exports['should treat HEAD /r/x/ and return 200 with header but no data'] = function (test) {test.ok(false);test.done();}
exports['should treat HEAD /r/x/? and return 200 with header but no data'] = function (test) {test.ok(false);test.done();}
//*/

exports['should treat POST /r/x/'] = function (test) {
	var verify = verifier.build(test);
	http_status.test = test;

	// GIVEN
	var _obj = {x:42,y:["plop","plip"]};
	var _created_obj_id = 42;
	
	var _mapping = {'x':'plop'};
	var _biz = { on: verify.add('biz.on()', function(type) {
		test.equal(type, 'plop');
		return { create: verify.add('biz.create()',function (obj,cb) { test.deepEqual(obj, _obj); obj.id=_created_obj_id; cb(obj.id);}) };
	}) };
	
	var _sub_u = 'x/', _sub_u_pathname = 'x/';
	_urlparser.run = verify.add('urlparser()',function (u) {test.equal(u, _sub_u); return {href: _sub_u, search: '?a=12&b=plop', query: {a:12,b:'plop'}, pathname: _sub_u_pathname}; });
	
	// under test
	var rest_u = rest.build('/r/' ,_biz, _mapping);
	var body = '{"x":42,"y":["plop","plip"]}';

	_http_status[201] = verify.add('http status 201 handler',function (res, type, data) {res.writeHead(201,{'Content-Type':'application/json'}); res.end(data); })

	var q = { method:'POST', url: '/r/x/', headers: {},
		on: function (d,c) { var o={
			data: function() { c(body); },
			end: function() { c(); } }; o[d](); }
	};
	var s = {
		writeHead : verify.add('response write header' ,function(code,t) {test.equal(code,201);test.deepEqual(t,{'Content-Type': 'application/json'})}),
		end: verify.add('response end', function(data) {test.equal(data,'"'+_created_obj_id+'"');})
	};
	
	// WHEN
	rest_u(q,s);
	
	// THEN
	verify.check();
	test.expect(12);
	test.done();
}

/*
exports['should treat PUT /r/x/{id}'] = function (test) {test.ok(false);test.done();}
exports['should treat PUT /r/x/{id}'] = function (test) {test.ok(false);test.done();}

exports['should treat DELETE /r/x/?'] = function (test) {test.ok(false);test.done();}
//*/
