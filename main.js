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

// initialize a few constant
var PORT = 8000;

var rest_methods = ['HEAD', 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
var rest_url_filter = /^\/r\/.*$/g;

var static_methods = ['HEAD', 'GET'];

// Node.js native modules
var https = require('https');
var fs = require('fs');
var urlparser = require('url').parse;

// Npm imported modules
var mime = require('mime');
var mongo = require('mongodb');
var crypto = require('cryptojs').Crypto;

// Home made framework modules
var filter = require('./lib/filter.js').inject('url');
var dispatch = require('./lib/dispatch.js').inject(filter.root_filter);
var http_status = require('./lib/http-status.js').inject().status;
var db = require('./lib/db.js').inject(mongo);
var biz = require('./lib/biz.js').inject(db);
var rest = require('./lib/rest.js').inject(http_status, urlparser);
var auth = require('./lib/auth.js').inject(http_status, urlparser);
var static = require('./lib/static.js').inject(http_status, mime.lookup, urlparser, fs);

// Application specific modules
var validator = require('validator.js').inject(crypto);
var mapping = {find:function(t) {return {'u':'user','login':'user'}[t]}}

var b = biz.build(validator,mapping);
var rest_basic_handler = rest.build('/r/', b);
var auth_handler = auth.build(b, '/r/', rest_basic_handler);

var rest_handler = dispatch.chain([
	dispatch.rule({method: 'POST', url:'/r/u/'}, rest_basic_handler),
	dispatch.rule(true, auth_handler)
]);

// Prepare the server
console.log("Starting Server.");
https
.createServer(
	{
		key: fs.readFileSync('server-key.pem'),
		cert: fs.readFileSync('server-cert.pem')
	},
	function (req,res) {
		console.log('%s %s %s',Date(), req.method, req.url);
		dispatch.chain([
			dispatch.rule({method: rest_methods, url: rest_url_filter }, rest_handler),
			dispatch.rule({method: static_methods, url : /^\/g.*$/g }, static.build('/g'.length,'./game')),
			dispatch.rule({method: static_methods}, static.build()),
			dispatch.rule([{method: filter.not(rest_methods), url: rest_url_filter}, {method: filter.not(static_methods)}], function(req,res) { http_status(405)(res); }),
			dispatch.rule(true, function(req,res) { http_status(500)(res); })
		])(req,res);
	}
)
.listen(PORT);

console.log("Server is ready.");
