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

// Injection of dependencies
exports.inject = function () {
	var injected = {};

	injected.data = function(code, text) {
		return function (res, type, data, headers) {
			headers = headers || {};
			headers['Content-Type']=type;
			res.writeHead(code, headers);
			res.end(data);
		}
	}

	injected.created = function(code,text) {
		return function (res, type, val) {
			res.writeHead(code, {'Content-Type': type});
			res.end(val);
		}
	}

	injected.moved = function(code,text) {
		return function (res, url) {
			res.writeHead(code, {'Location': url});			
			res.end();
		}
	}

	injected.no_response = function(code,text) {
		return function (res) {
			res.writeHead(code);
			res.end();
		}
	}

	injected.default_provide = function (code, text) {
		return "<html><body>"+code+" "+text+".</body></html>"
	}

	injected.error = function(code, text) {
		return function (res, provide) {
			provide = provide || injected.default_provide;
			res.writeHead(code, {'Content-Type': 'text/html'});
			res.end(provide(code, text));
		}
	}

	var status_code = {};

	injected.status = function (code) {
		return status_code[code];
	}

	function define(code,text,handlerbuilder) {
		status_code[code] = handlerbuilder(code,text);
	}
	
	// The request was fulfilled.
	define(200, "OK", injected.data);

	// Following a POST command, this indicates success, but the 
	// textual part of the response line indicates the URI by which the 
	// newly created document should be known.
	define(201, "Created", injected.created);

	// The request has been accepted for processing, but the 
	// processing has not been completed. The request may or may not 
	// eventually be acted upon, as it may be disallowed when 
	// processing actually takes place. there is no facility for 
	// status returns from asynchronous operations such as this.
	define(202, "Accepted", injected.no_response);

	// When received in the response to a GET command, this 
	// indicates that the returned metainformation is not a definitive 
	// set of the object from a server with a copy of the object, but 
	// is from a private overlaid web. This may include annotation 
	// information about the object, for example.
//	define(203, "Partial Information", );

	// Server has received the request but there is no information to 
	// send back, and the client should stay in the same document view. 
	// This is mainly to allow input for scripts without changing the 
	// document at the same time.
	define(204, "No Response", injected.no_response);

	// The data requested has been assigned a new URI, the change is 
	// permanent. (N.B. this is an optimisation, which must, 
	// pragmatically, be included in this definition. Browsers with 
	// link editing capabiliy should automatically relink to the new 
	// reference, where possible)
	//
	// The response contains one or more header lines of the form
	//
    //   URI: <url> String CrLf
	//
	// Which specify alternative addresses for the object in question. 
	// The String is an optional comment field. If the response is to 
	// indicate a set of variants which each correspond to the 
	// requested URI, then the multipart/alternative wrapping may be 
	// used to distinguish different sets
	define(301, "Moved", injected.moved);

	// The data requested actually resides under a different URL, 
	// however, the redirection may be altered on occasion (when making
	// links to these kinds of document, the browser should default to
	// using the Udi of the redirection document, but have the option 
	// of linking to the final document) as for "Forward". The 
	// response format is the same as for Moved .
	define(302, "Found", injected.moved);

	//	Method: <method> <url>
	//	body-section
	//
	// Note: This status code is to be specified in more detail. For 
	// the moment it is for discussion only.
	//
	// Like the found response, this suggests that the client go try 
	// another network address. In this case, a different method may be
	// used too, rather than GET.
	//
	// The body-section contains the parameters to be used for the 
	// method. This allows a document to be a pointer to a complex 
	// query operation.
	//
	// The body may be preceded by the following additional fields as 
	// listed.
	define(303, "Method", injected.no_response);

	// If the client has done a conditional GET and access is allowed, 
	// but the document has not been modified since the date and time 
	// specified in If-Modified-Since field, the server responds with a
	// 304 status code and does not send the document body to the 
	// client.
	//
	// Response headers are as if the client had sent a HEAD request, 
	// but limited to only those headers which make sense in this 
	// context. This means only headers that are relevant to cache 
	// managers and which may have changed independently of the 
	// document's Last-Modified date. Examples include Date , Server 
	// and Expires .
	//
	// The purpose of this feature is to allow efficient updates of 
	// local cache information (including relevant metainformation) 
	// without requiring the overhead of multiple HTTP requests (e.g. a
	// HEAD followed by a GET) and minimizing the transmittal of 
	// information already known by the requesting client (usually a 
	// caching proxy).
	define(304, "Not Modified ", injected.no_response);

	// The request had bad syntax or was inherently impossible to be 
	// satisfied.	
	define(400, "Bad request", injected.error);
	
	// The parameter to this message gives a specification of 
	// authorization schemes which are acceptable. The client should 
	// retry the request with a suitable Authorization header.
	define(401, "Unauthorized", injected.error);
	
	// The parameter to this message gives a specification of 
	// charging schemes acceptable. The client may retry the request 
	// with a suitable ChargeTo header.
	define(402, "Payment Required", injected.error);

	// The request is for something forbidden. Authorization will 
	// not help.
	define(403, "Forbidden", injected.error);

	// The server has not found anything matching the URI given
	define(404, "Not found", injected.error);
	
	// A request was made of a resource using a request method not 
	// supported by that resource; for example, using GET on a form 
	// which requires data to be presented via POST, or using PUT on a 
	// read-only resource.
	define(405, "Method Not Allowed", injected.error);

	// The server encountered an unexpected condition which 
	// prevented it from fulfilling the request.
	define(500, "Internal Error", injected.error);

	// The server does not support the facility required.
	define(501, "Not implemented", injected.error);

	return injected;
}
