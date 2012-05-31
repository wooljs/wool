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
		
		var search = function(res, path, cb, cberr) {
			cberr = typeof cberr === 'function' ? cberr : function (err,res) {
				console.error(Date(), err)
				http_status(errno_httpcode[err.errno])(res)
			}
			console.log(Date(), 'search', path)
			return function () {
				var arg = Array.prototype.slice.call(arguments)
				fs.readFile(path, function (err, data) {
					if (err) {
						console.log(Date(), 'not found', path)
						cberr(err,res, arg, cb)
					} else {
						console.log(Date(), 'found', path)
						arg.push(data)
						cb.apply(null,arg)
					}
				})
			}
		}
		
		return function (req, res) {
			var parsed = urlparser(req.url, true)
			parsed.pathname.replace(regex,function (_0, _1, _2) {
				var template_name = _1 || 'index',
					template_path = template_folder + '/' + template_name + '.html',
					data_path =  data_folder+ '/' + template_name +'/'+ (_2 || '0') + '.json'
					
				search(res, template_path,
					search(res, data_path,
						function(template, data) {
							try {
								var html = _.template(new String(template), data ? JSON.parse(new String(data)) : {})
								http_status(200)(res, "text/html", html)
							} catch (e) {
								console.error("%s While parsing template: '%s'%s found data:'%s'%s found: %s", Date(), template_path, template ?'':' not', data_path, data?'':' not', e)
								http_status(data ? 500 : 404)(res)
							}
						},
						function(err, res, arg, cb) {
							arg.push(undefined)
							cb.apply(null,arg)
						}
					)
				)()
			})
		}
	}
	return injected
}
