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

exports.inject = function (http_status, mime, urlparser, fs, injected_path, injected_location) {
	console.log(http_status);
	injected_path = injected_path || './static';
	injected_location = injected_location || 'index.html';
	
	var injected={};
	injected.build = function (mask, default_path, default_location) {
		default_path = default_path || injected_path;
		default_location = default_location || injected_location;
		
		var errno_httpcode = {
			2: 404,
			34 : 404,
			3 : 403
		}
		
		var manage_error = function (err,res) {
			console.log(err);
			http_status(errno_httpcode[err.errno])(res);
		}
		
		var run_path = function (path, url, res) {
			// check what is this file					
			fs.stat(path, function (err, stats) {
				if (err) {
					manage_error(err,res);
				} else {
					if (stats.isDirectory()) {
						if (path.match(/[^\/]$/)) {
							http_status(302)(res, url+'/');
						} else {
							run_path((path+'/'+default_location).replace(/\/+/g,'/'), url, res);
						}
					} else {
						fs.readFile(path, function (err, data) {
							if (err) {
								manage_error(err,res);
							} else {
								http_status(200)(res, mime(path), data);
							}
						});							
					}
				}
			});
		}
		
		return function (req, res) {
			var parsed = urlparser(req.url, true);
			var current_path = default_path + parsed.pathname.substring(mask);
			run_path(current_path, req.url, res);
		}
	}
	return injected;
}
