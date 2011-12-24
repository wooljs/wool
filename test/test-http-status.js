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

var mime = function (file) {
	if (file.match(/\.html$/)) return 'text/html';
}
var http_status = require('http-status.js').inject(logger,mime);

var count={};
var inc = function(context) {
	count[context] = (count[context] || 0) + 1;
}

var c = "code";
var t = "text";
var path = "/index.html";
var data = "data";
var url = "url";

exports['should process data'] = function (test) {	
	var data_writeHead = 'data writeHead';
	var data_end = 'data end';
	
	var res = {
		writeHead : function (code, ct) {
			inc(data_writeHead);
			test.strictEqual(code,c);
			test.deepEqual(ct,{'Content-Type' : mime(path)});
		},
		end : function(d) {
			inc(data_end);
			test.strictEqual(d,data);
		}
	}
	
	http_status.data(c,t)(res, path, data);
	
	test.equal(1, count[data_writeHead]);
	test.equal(1, count[data_end]);
	
	test.done();
}

exports['should process created'] = function (test) {
	var created_writeHead = 'created writeHead';
	var created_end = 'created end';
	
	var res = {
		writeHead : function (code, ct) {
			inc(created_writeHead);
			test.strictEqual(code,c);
			test.deepEqual(ct,{'Content-Type' : 'text/html'});
		},
		end : function(d) {
			inc(created_end);
			test.strictEqual(d,url);
		}
	}
	
	http_status.created(c,t)(res, url);
	
	test.equal(1, count[created_writeHead]);
	test.equal(1, count[created_end]);
	
	test.done();
}

exports['should process no_response'] = function (test) {
	var no_response_writeHead = 'no_response writeHead';
	var no_response_end = 'no_response end';
	
	var res = {
		writeHead : function (code, ct) {
			inc(no_response_writeHead);
			test.strictEqual(code,c);
			test.ok(typeof ct == 'undefined');
		},
		end : function(d) {
			inc(no_response_end);
			test.ok(typeof d == 'undefined');
		}
	}
	
	http_status.no_response(c,t)(res);
	
	test.equal(1, count[no_response_writeHead]);
	test.equal(1, count[no_response_end]);
	
	test.done();
}

exports['should process error'] = function (test) {
	var error_writeHead = 'error writeHead';
	var error_end = 'error end';
	var error_provide = 'error provide';
	
	var provide = function (code, text) {
		inc(error_provide);
		test.strictEqual(code,c);
		test.strictEqual(text,t);
		return data;
	}

	http_status.default_provide = provide;

	var res = {
		writeHead : function (code, ct) {
			inc(error_writeHead);
			test.strictEqual(code,c);
			test.deepEqual(ct,{'Content-Type' : 'text/html'});
		},
		end : function(d) {
			inc(error_end);
			test.equal(d,data);
		}
	}
	
	http_status.error(c,t)(res);
	http_status.error(c,t)(res, provide);
	
	test.equal(2, count[error_writeHead]);
	test.equal(2, count[error_end]);
	test.equal(2, count[error_provide]);
	
	test.done();
}
