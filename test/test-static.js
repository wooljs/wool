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

var status_code = {}

var http_status = function(code){
	logger.trace("http_status({})",code);
	return status_code[code];
}

var urlparser_real;
var urlparser = function (url) {
	return urlparser_real();
}

var fs = {}

var counter = require('counter.js');
var default_path = './static';
var default_location = 'index.html';

var static = require('static.js').inject(logger, http_status, urlparser, fs, default_path, default_location);

exports['should manage root path /'] = function (test) {

	var c_match = counter.build();
	var c_200 = counter.build();
	var c_unmatch = counter.build();

	// GIVEN
	var url = 'http://localhost:8000';
	urlparser_real = function () {
		return {pathname:"/"};
	}
	
	var data = "plop";

	status_code[200] = function(res, p, d) {
		logger.trace("http_status(200)({}, {}, {})", res, p, d);
		c_200.inc();
		test.equal(p,'./static/index.html');
		test.strictEqual(d,data);
	}

	fs.stat = function (path, fun) {
		fun (false , {
			isDirectory : function () {
				var matching = path.match('^./static/$');
				if (matching) {
					c_match.inc();
				} else {
					c_unmatch.inc();
				}
				return matching;
			}
		});
	}
	fs.readFile = function (path, fun) {
		fun (false , data);
	}
	
	// WHEN
	static.build()({req:{'url':url},res:{}});

	// THEN
	
	test.equal(c_match.check(), 1);
	test.equal(c_unmatch.check(), 1);
	test.equal(c_200.check(), 1);
	test.done();
	
	delete urlparser_real;
	delete fs.stat;
	delete fs.readFile;
	delete status_code[200];
}

exports['should manage redirect url http://.../foo to http://.../foo/'] = function (test) {

	var c_match = counter.build();
	var c_302 = counter.build();
	var c_unmatch = counter.build();

	// GIVEN
	var url = 'http://localhost:8000/foo';
	urlparser_real = function () {
		return {pathname:"/foo"};
	}
	
	var data = "plop";

	status_code[302] = function(res, u) {
		logger.trace("http_status(302)({}, {})", res, u);
		c_302.inc();
		test.equal(u,'http://localhost:8000/foo/');
	}

	fs.stat = function (path, fun) {
		fun (false , {
			isDirectory : function () {
				var matching = path.match('^./static/foo$');
				if (matching) {
					c_match.inc();
				} else {
					c_unmatch.inc();
				}
				return matching;
			}
		});
	}
	fs.readFile = function (path, fun) {
		fun (false , data);
	}
	
	// WHEN
	static.build()({req:{'url':url},res:{}});

	// THEN
	
	test.equal(c_match.check(), 1);
	test.equal(c_unmatch.check(), 0);
	test.equal(c_302.check(), 1);
	test.done();
	
	delete urlparser_real;
	delete fs.stat;
	delete fs.readFile;
	delete status_code[200];
}

exports['should manage path to file /test.html '] = function (test) {

	var c_match = counter.build();
	var c_200 = counter.build();

	// GIVEN
	var url = 'http://localhost:8000/test.html';
	urlparser_real = function () {
		return {pathname:"/test.html"};
	}
	
	var data = "plop";

	status_code[200] = function(res, p, d) {
		logger.trace("http_status(200)({}, {}, {})", res, p, d);
		c_200.inc();
		test.equal(p,'./static/test.html');
		test.strictEqual(d,data);
	}

	fs.stat = function (path, fun) {
		fun (false , {
			isDirectory : function () {
				c_match.inc();
				return false;
			}
		});
	}
	fs.readFile = function (path, fun) {
		fun (false , data);
	}
	
	// WHEN
	static.build()({req:{'url':url},res:{}});

	// THEN
	
	test.equal(c_match.check(), 1);
	test.equal(c_200.check(), 1);
	test.done();
	
	delete urlparser_real;
	delete fs.stat;
	delete fs.readFile;
	delete status_code[200];
}

exports['should manage secondary root path /plop'] = function (test) {

	var c_match = counter.build();
	var c_200 = counter.build();
	var c_unmatch = counter.build();

	// GIVEN
	var url = 'http://localhost:8000/plop/';
	
	var new_root = "/plop"
	
	urlparser_real = function () {
		return {pathname:"/plop/"};
	}
	
	var data = "plop";

	status_code[200] = function(res, p, d) {
		logger.trace("http_status(200)({}, {}, {})", res, p, d);
		c_200.inc();
		test.equal(p,'./x/index.html');
		test.strictEqual(d,data);
	}

	fs.stat = function (path, fun) {
		fun (false , {
			isDirectory : function () {
				var matching = path.match('^./x/$');
				if (matching) {
					c_match.inc();
				} else {
					c_unmatch.inc();
				}
				return matching;
			}
		});
	}
	fs.readFile = function (path, fun) {
		fun (false , data);
	}
	
	// WHEN
	static.build(new_root.length,"./x")({req:{'url':url},res:{}});

	// THEN
	
	test.equal(c_match.check(), 1);
	test.equal(c_unmatch.check(), 1);
	test.equal(c_200.check(), 1);
	test.done();
	
	delete urlparser_real;
	delete fs.stat;
	delete fs.readFile;
	delete status_code[200];
}
