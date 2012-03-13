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

exports.inject = function (http_status, urlparser) {
	return {
		build: function (biz, login_url, handler) {
			return function (req, res) {
				var TOKEN_HEADER = 'X-Token';
				// Check we have a token
				if (req.headers.hasOwnProperty(TOKEN_HEADER)) {
					// is token still valid
					var session_id = req.headers[TOKEN_HEADER];
					var parsed = urlparser(req.url.substring(login_url.length), true);
					biz.auth(session_id, parsed.pathname, function(success) {
						if (success) { handler(req, res); } 
						else { http_status(401)(res); }
					});
				} else
				// Check for login request
				if (req.method=='POST' && req.url==login_url) {
					var obj = undefined;
					req.on('data', function (data) {
						obj = JSON.parse(data);
						biz.login(obj, function(err,session_id) {
							if (err) { http_status(err.status)(res); }
							if (typeof session_id!=='undefined') { http_status(201)(res,'application/json','"'+session_id+'"'); }
							else { http_status(400)(res); }
						});
					});
					req.on('end', function () { if (!obj) { http_status(500)(res); } });
				}
				// No header neither login request, let's refuse !
				else { http_status(401)(res); }
			}
		}
	}
}