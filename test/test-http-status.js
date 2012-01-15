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

var logger = require('cnlogger').logger(module); 
var counter = require('counter'); 

var mime = function (file) {
	if (file.match(/\.html$/)) return 'text/html';
}
var http_status = require('http-status.js').inject(logger,mime);

var c = "code";
var t = "text";
var path = "/index.html";
var data = "data";
var url = "url";

exports['should process data'] = function (test) {	
	var c_writeHead = counter.build();
	var c_end = counter.build();
	
	var res = {
		writeHead : function (code, ct) {
			c_writeHead.inc();
			test.strictEqual(code,c);
			test.deepEqual(ct,{'Content-Type' : mime(path)});
		},
		end : function(d) {
			c_end.inc();
			test.strictEqual(d,data);
		}
	}
	
	http_status.data(c,t)(res, path, data);
	
	test.equal(1, c_writeHead.check());
	test.equal(1, c_end.check());
	
	test.done();
}

exports['should process created'] = function (test) {
	var c_writeHead = counter.build();
	var c_end = counter.build();
	
	var type = 'text/plain';
	
	var res = {
		writeHead : function (code, ct) {
			c_writeHead.inc();
			test.strictEqual(code,c);
			test.deepEqual(ct,{'Content-Type' : type});
		},
		end : function(d) {
			c_end.inc();
			test.strictEqual(d,url);
		}
	}
	
	http_status.created(c,t)(res, type, url);
	
	test.equal(1, c_writeHead.check());
	test.equal(1, c_end.check());
	
	test.done();
}

exports['should process moved'] = function (test) {
	var c_writeHead = counter.build();
	var c_end = counter.build();
	
	var res = {
		writeHead : function (code, ct) {
			c_writeHead.inc();
			test.strictEqual(code,c);
			test.deepEqual(ct,{'Location' : url});
		},
		end : function(d) {
			c_end.inc();
			test.ok(typeof d == 'undefined');
		}
	}
	
	http_status.moved(c,t)(res, url);
	
	test.equal(1, c_writeHead.check());
	test.equal(1, c_end.check());
	
	test.done();
}

exports['should process no_response'] = function (test) {
	var c_writeHead = counter.build();
	var c_end = counter.build();
	
	var res = {
		writeHead : function (code, ct) {
			c_writeHead.inc();
			test.strictEqual(code,c);
			test.ok(typeof ct == 'undefined');
		},
		end : function(d) {
			c_end.inc();
			test.ok(typeof d == 'undefined');
		}
	}
	
	http_status.no_response(c,t)(res);
	
	test.equal(1, c_writeHead.check());
	test.equal(1, c_end.check());
	
	test.done();
}

exports['should process error'] = function (test) {
	var c_writeHead = counter.build();
	var c_end = counter.build();
	var c_provide = counter.build();
	
	var provide = function (code, text) {
		c_provide.inc();
		test.strictEqual(code,c);
		test.strictEqual(text,t);
		return data;
	}

	http_status.default_provide = provide;

	var res = {
		writeHead : function (code, ct) {
			c_writeHead.inc();
			test.strictEqual(code,c);
			test.deepEqual(ct,{'Content-Type' : 'text/html'});
		},
		end : function(d) {
			c_end.inc();
			test.equal(d,data);
		}
	}
	
	http_status.error(c,t)(res);
	http_status.error(c,t)(res, provide);
	
	test.equal(2, c_writeHead.check());
	test.equal(2, c_end.check());
	test.equal(2, c_provide.check());
	
	test.done();
}
