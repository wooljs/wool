var assert = require('assert')

var jsmockito = require('./test-lib/jsmockito-1.0.4.js');
var jshamcrest = require('./test-lib/jshamcrest.js');

//var plop = mock(Array);

// run unit tests

//module under test
var server = require('./server');


function test_server_callback(url_param, err,data) {
	server.callback(function (url_to_parse) {
			if (url_to_parse == '/index.html') {
				return {
					href: '/index.html',
					search: '',
					query: '',
					pathname: '/index.html'					
				}
			} else
			if (url_to_parse == '/j/u/42') {
				return {
					href: '/j/u/42',
					search: '',
					query: '',
					pathname: '/j/u/42'					
				}
			} else {
				return {
					href: '/',
					search: '',
					query: '',
					pathname: '/'
				}
			}
		},
		{
			readFile : function() {
				var args = Array.prototype.slice.call(arguments);
				assert.equal(2, args.length);
				assert.equal('./static/index.html', args[0]);
				args[1](err,data)
			}
		}
	)
	(
		{
			url : url_param
		},
		{
			writeHead : function(){
				var args = Array.prototype.slice.call(arguments);
				assert.equal(2,args.length);
				assert.equal(200, args[0]);
				assert.equal('text/html', args[1]['Content-Type']);
			},
			end : function (d) {
				assert.equal(data,d);
			}
		}
	)
}

test_server_callback("/", 0 ,"plop");
test_server_callback("/index.html",0,"plop");

test_server_callback("/j/u/42", 0 ,"plop");
