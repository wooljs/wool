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

var status_code = {}

var http_status = function(code){
	return status_code[code];
}

var urlparser_real;
var urlparser = function (url) {
	return urlparser_real();
}

var fs = {}

var counter = require('../lib/counter.js');
var default_path = './test-static-resource';
var default_location = 'index.html';

var mime = function() { return 'text/html'; }

var static = require('../lib/static.js')(http_status, fs, urlparser, str_to_obj, mu2);

exports['should start unit test'] = function (test) {
	test.ok(false);
	test.done();
}
