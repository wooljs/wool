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

var urlparser = function (url) {
	return {
		href: url,
		search: '',
		query: '',
		pathname: url
	}
}

var fs = {}

var counter = require('counter.js');
var static = require('static.js').inject(logger, http_status, urlparser, fs);

exports['should run_path ./static/'] = function (test) {

	var c = counter.build();

	// GIVEN
	var path = './static/';
	var url = 'http://localhost:8000';
	var data = "plop";

	status_code[200] = function(res, p, d) {
		logger.trace("http_status(200)({}, {}, {})", res, p, d);
		
		test.equal(p,'./static/index.html');
		test.strictEqual(d,data);
	}

	fs.stat = function (path, fun) {
		fun (false , {
			isDirectory : function () {
				c.inc();
				return path.match('^./static/$');
			}
		});
	}
	fs.readFile = function (path, fun) {
		fun (false , data);
	}
	
	// WHEN
	static.run_path(path, url, {});

	// THEN
	
	test.equal(c.check(), 1);
	test.done();
};

/*

var default_location = '/index.html';

var s = static.build(default_location, urlparser, mime, fs);

exports['should run static_rule'] = function (test) {
	test.ok(false,'test to be written');
	test.done();
};
 */
