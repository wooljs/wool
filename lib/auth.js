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

module.exports = function (http_status, moment, urlparser) {
	return {
		build: function (biz, login_url, handler, SESSION_COOKIE_NAME) {
			return function (req, res) {
				// Check we have a Cookie
				if (req.headers.cookie) {
					cookies = {}
					req.headers.cookie.split(';').forEach(function (cookie) {
						var parts = cookie.split('=')
						cookies[parts[0].trim()] = parts[1].trim()
					})
					// is token still valid
					var session_id = cookies[SESSION_COOKIE_NAME],
						parsed = urlparser(req.url.substring(login_url.length), true)
					biz.auth(session_id, parsed.pathname, function(err) {
						if (!err) handler(req, res)
						else setTimeout(function() {http_status(401)(res, {
							'Set-Cookie': SESSION_COOKIE_NAME + '=' + 'deleted' + '; Path=/; '+
									'Expires='+moment().add('d', -100).format("ddd, DD-MMM-YYYY HH:mm:ss Z") +
									'; Secure; HttpOnly'
						})}, 1000)
					})
				} else
				// Check for login request
				if (login_url && req.method=='POST' && req.url==login_url) {
					var obj = undefined
					req.on('data', function (data) {
						obj = JSON.parse(data)
						biz.login(obj, function(err,session_id) {
							if (err) http_status(err.status)(res)
							else if (typeof session_id!=='undefined') {
								console.log(Date(), 'Setting Cookie ', SESSION_COOKIE_NAME,' with session_id', session_id)
								http_status(201)(res,'application/json','"./play.html"', {
									'Set-Cookie': SESSION_COOKIE_NAME + '=' + session_id + '; Path=/; '+
									'Expires='+moment().add('d', 1).format("ddd, DD-MMM-YYYY HH:mm:ss Z") +
									'; Secure; HttpOnly'
								})
							}
							else setTimeout(function() {http_status(401)(res)}, 1000)
						})
					})
					req.on('end', function () { if (!obj) setTimeout(function() {http_status(500)(res)}, 1000) });
				}
				// No header neither login request, let's refuse !
				else setTimeout(function() {http_status(401)(res)}, 1000)
			}
		}
	}
}
