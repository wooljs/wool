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

var http_status = function(){return function(){}}

var urlparser = function(){}

var rest = require('rest.js').inject(logger, http_status, urlparser);

var urlparser = function (url) {
	return {
		href: url,
		search: '',
		query: '',
		pathname: url
	}
}

exports['should '] = function (test) {
	test.ok(false,'test to be written');
	test.done();
};
