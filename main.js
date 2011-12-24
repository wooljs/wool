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
var logger = require('cnlogger').logger(module); 

// Home made modules
var dispatch = require('dispatch.js').inject(logger);
var http_status = require('http-status.js').inject(logger, mime.lookup).status;
var rest = require('rest.js').inject(logger, http_status);
var static = require('static.js').inject(logger, http_status, urlparser, fs);

// initialize a few constant
var PORT = 8000;

// Prepare the
logger.info("Starting Server.");
https.createServer(
	{
		key: fs.readFileSync('server-key.pem'),
		cert: fs.readFileSync('server-cert.pem')
	},
	dispatch.build(
		Date,
		dispatch.chain([
			dispatch.rule(/^\/u\/.*$/g, rest.build('/u/',userdb)),
			dispatch.rule(true, static.build())
		])
	)
).
listen(PORT);

logger.info("Server is ready.");
