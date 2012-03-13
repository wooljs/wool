// Node.js native modules
var https = require('https');
var fs = require('fs');
var urlparser = require('url').parse;

// Npm imported modules
var mime = require('mime');

// Home made modules
var filter = require('./lib/filter.js').inject('url');
var dispatch = require('./lib/dispatch.js').inject(filter.root_filter);
var http_status = require('./lib/http-status.js').inject().status;
var rest = require('./lib/rest.js').inject(http_status, urlparser);
var auth = require('./lib/auth.js').inject(http_status, urlparser);
var static = require('./lib/static.js').inject(http_status, mime.lookup, urlparser, fs);


module.exports = 
