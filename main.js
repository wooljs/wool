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

// Node.js native modules
var https = require('https');
var fs = require('fs');
var urlparser = require('url').parse;

// Npm imported modules
var mime = require('mime');

// Home made modules
var filter = require('filter.js').inject('url');
var dispatch = require('dispatch.js').inject(filter.root_filter);
var http_status = require('http-status.js').inject().status;
var rest = require('rest.js').inject(http_status, urlparser);
var auth = require('auth.js').inject(http_status, urlparser);
var static = require('static.js').inject(http_status, mime.lookup, urlparser, fs);

// initialize a few constant
var PORT = 8000;

var rest_methods = ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
var rest_url_filter = /^\/r\/.*$/g;

var static_methods = ['HEAD', 'GET'];
var biz = {};
var rest_handler = rest.build('/r/', biz);
var auth_handler = auth.build(biz, '/r/', filter.root_filter({method: 'POST', url: '/r/u/'}), rest_handler);

// Prepare the
console.log("Starting Server.");
https
.createServer(
	{
		key: fs.readFileSync('server-key.pem'),
		cert: fs.readFileSync('server-cert.pem')
	},
	dispatch.chain([
		dispatch.rule({method: rest_methods, url: rest_url_filter }, auth_handler),
		dispatch.rule({method: static_methods, url : /^\/g.*$/g }, static.build('/g'.length,'./game')),
		dispatch.rule({method: static_methods}, static.build()),
		dispatch.rule([{method: filter.not(rest_methods), url: rest_url_filter}, {method: filter.not(static_methods)}], function(req,res) { http_status(405)(res); }),
		dispatch.rule(true, function(req,res) { http_status(500)(res); })
	])
)
.listen(PORT);

console.log("Server is ready.");
