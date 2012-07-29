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

// simple export to move on with

module.exports = require('knit').inject(function (knit, url, fs) {
	return knit.config(function (bind) {
		bind('urlparser').to(url.parse)
		bind('http_status').to(require('./lib/http-status.js')().status)
		bind('default_field').to('url')
		bind('def_filter').to(require('./lib/filter.js'))
		bind('str_to_obj').to(require('./lib/str_to_obj.js')).is('builder')
		bind('filter').to(function (def_filter) {return def_filter('url')}).is('builder')
		bind('root_filter').to(function (filter) {return filter.root_filter}).is('builder')
		bind('dispatch').to(require('./lib/dispatch.js')).is('builder')
		bind('static').to(function (http_status, mime, urlparser, fs) {return require('./lib/static.js')(http_status, mime, urlparser, fs);}).is('builder')
		bind('template').to(require('./lib/template.js')).is('builder')
		bind('rest').to(require('./lib/rest.js')).is('builder')
		bind('auth').to(require('./lib/auth.js')).is('builder')
		bind('biz').to(require('./lib/biz.js')).is('builder')
		bind('db').to(require('./lib/db.js')).is('builder')
	}).inject(function () {
		return {ready:true}
	})
})
	
	
