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

exports.inject = function (http_status, fs, urlparser, mime, str_to_obj, mu) {
	var injected={};
	injected.regex = /^\/?(.*?)(?:-(.*?))?(?:\.html)?$/
	injected.build = function (template_base_folder,data_base_folder,regex) {
		regex = regex || this.regex
			
		var errno_httpcode = {
			2: { code: 404, msg: "file not found"},
			34 : { code: 404, msg: "file not found"},
			3 : { code: 403, msg: "access denied"}
		}		
		var manage_error = function (err,path,res,prefix) {
			console.error("%s %s%s %s", Date(), prefix||'',errno_httpcode[err.errno].msg, path);
			http_status(errno_httpcode[err.errno].code)(res);
		}
		
		return function (req, res) {
			var parsed = urlparser(req.url, true)
			parsed.pathname.replace(regex,function (_0, _1, _2) {
				var template_name = _1 || 'index',
					template_path = template_base_folder + '/' + template_name + '.html',
					data_folder =  data_base_folder + '/' + template_name,
					data_path =  data_folder + '/' + (_2 || '0') + '.json'
				
				mu.compile(template_path, function (err, template) {
					function render(data) {
						var stream = mu.render(template, data)
						var html = ''
						stream.on('data',function (d) {
							html+=d
						})
						stream.on('end',function () {
							http_status(200)(res, "text/html", html)
						})
					}
					
					if (err) {
						manage_error(err,template_path,res,'Template: ')
					} else {
						console.error(Date(), "Template found", template_path)
						fs.stat(data_folder, function (err, stats) {
							if (err && err.errno==34) {
								console.error(Date(), "No data folder", data_folder, err)
								render({})
							} else if (stats.isDirectory()) {
								fs.readFile(data_path, function (err, data) {
									if (err) {
										manage_error(err,template_path,res,'Data: ')
									} else {
										try {
											console.error(Date(), "Data found", data_path)
											render(str_to_obj(String(data)))
										} catch(e) {
											console.error(Date(), "Error while rendering", e)
											http_status(500)(res)
										} 
									}
								})
							} else {
								console.error(Date(), "not a folder", data_folder)
								render({})
							}
						})
					}
				})
			})
		}
	}
	return injected
}
