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

exports.inject = function (http_status, fs, urlparser, mime, _) {
	var injected={};
	injected.regex = /^\/?(.*?)(?:-(.*?))?(?:\.html)?$/
	injected.build = function (template_folder,data_folder,regex) {
		regex = regex || this.regex
			
		var errno_httpcode = {
			2: 404,
			34 : 404,
			3 : 403
		}
		var manage_error = function (res,cb) {
			return function (err,data) {
				if (err) {
					console.log(err);
					http_status(errno_httpcode[err.errno])(res);
				} else {
					cb(data)
				}
			}
		}
		
		var templates = {},
			datas = {},
		
			search = function(res, path, into, cb) {
				console.log('search', path)
				return function () {
					var arg = Array.prototype.slice.call(arguments)
					if ( ! (path in into)) {
						fs.readFile(path, manage_error(res, function (data) {
							arg.push(into[path]=data)
							cb.apply(null,arg)
						}))
					} else {
						arg.push(into[path])
						cb.apply(null,arg)
					}
				}
			}
		
		return function (req, res) {
			var parsed = urlparser(req.url, true)
			parsed.pathname.replace(regex,function (_0, _1, _2) {
				var template_name = _1 || 'index',
					template_path = template_folder + '/' + template_name + '.html',
					data_path =  data_folder+ '/' + template_name +'/'+ (_2 || '0') + '.json'
					
				search(res, template_path, templates, search(res, data_path, datas, function(template,data) {
					console.log(template,data)
					http_status(200)(res, "text/html", template);
				}))()
			})
		}
	}
	return injected
}
