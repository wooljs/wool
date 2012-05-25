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
	var type = 'application/json';
	return {
		build: function (root, biz, SESSION_COOKIE_NAME) {
			var rx = /^(.+?)\/(.*)$/
			return function (req, res) {
				var parsed = urlparser(req.url.substring(root.length), true);
				parsed.pathname.replace(rx,function (_0, entity_type,_2) {
					debugger;					
					// find a matching entity type
					function ok_200(err, data) {
						if (typeof data != 'undefined') { http_status(200)(res, type, data);}
						else { http_status(404)(res); }
					}
					if (typeof entity_type != 'undefined') {
						var sub = {
							get: function (parsed, req, res) {
								// This URI contains an id
								if (_2.length > 0) {
									if (SESSION_COOKIE_NAME && "!" === _2) {
										if (req.headers.cookie) {
											cookies = {}
											req.headers.cookie.split(';').forEach(function (cookie) {
												var parts = cookie.split('=')
												cookies[parts[0].trim()] = parts[1].trim()
											})
											// is token still valid
											var session_id = cookies[SESSION_COOKIE_NAME]
											biz.on(entity_type).getById(session_id, ok_200);
										} else
											http_status(404)(res);
									} else
										biz.on(entity_type).getById(_2, ok_200);
								}
								// Retrieve all objects that matches the query 
								else { biz.on(entity_type).find(parsed.query, ok_200); }
							},
							head: function(parsed, req, res) {
							},
							post: function(parsed, req, res) {
								var obj = undefined;
								req.on('data', function (data) {
									obj=JSON.parse(data);
									biz.on(entity_type).save(obj, function(err, id) {
										if (!err && typeof data != 'undefined') { http_status(201)(res, type, '"'+id+'"');}
										else if ('status' in err) {
											console.log(Date(), 'error ', err)
											 var herr={};
											 if (err.error.empty.length>0) { herr['X-ERR-EMPTY'] = err.error.empty.join(', '); }
											 if (err.error.not_identical.length>0) { herr['X-ERR-NOT-IDENTICAL'] = err.error.not_identical.join(', '); }
											 if (err.error.not_unique.length>0) { herr['X-ERR-NOT-UNIQUE'] = err.error.not_unique.join(', '); }
											 http_status(err.status)(res,herr);
										}
										else { http_status(400)(res); }
									});
								});
								req.on('end', function () { if (!obj) { http_status(500)(res); } });
							},
							put: function (parsed, req, res) {
							},
							delete: function (parsed, req, res) {
								// This URI contains an id
								if (_2.length > 0) { biz.on(entity_type).remove(_2, function(err) {http_status(204)(res);}); }
								// Retrieve all objects that matches the query 
								// else { biz.on(entity_type).find(parsed.query, ok_200); }
							}	
						}
						sub[req.method.toLowerCase()](parsed, req, res);
					}
					else { http_status(404)(res); }
				});
			}
		}
	}
}
