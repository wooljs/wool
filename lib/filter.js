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
 
module.exports = function (default_field) {
	function filter_object(def, field) {
		
		if (typeof field != 'undefined') return function (o) {
			return typeof o[field] == 'undefined' || filter_object(def)(o[field])
		}
		
		var filters = Object.getOwnPropertyNames(def).map(function(u) { return {d: u, f: build_filter(u)(def[u])} })
		return function (o) {
			try {
				filters.forEach(function (x) {if (typeof o[x.d] == 'undefined' || ! x.f(o)) { throw false }})
			} catch (e) {
				if (e===false) return false 
				throw e
			}
			return true
		}	
	}
	
	/**
	 * (field, ((def) -> (o) -> boolean), ((def) -> (o) -> boolean) ) -> (def) -> (o) -> boolean
	 */
	function build_filter(field) {
		return function (def) {
			switch (typeof def) {
				case 'boolean': { return function(o) { return def} }
				case 'function': { return function(o) { return def(o[field]) } }
				case 'string': { return function(o) { return typeof o[field] != 'undefined' && o[field] == def} }
				case 'object':
					// a regex is used to match field
					if (def instanceof RegExp){ return function (o) { return typeof o[field] != 'undefined' && o[field].match(def)} }
					// if its an array, the filter is ok if any of the element is ok
					if (def instanceof Array) { 
						var filters = def.map(function(v) {
							return build_filter_root(field)(v)
						})
						return function (o) {
							try {
								filters.forEach(function (f) {if (f(o)) { throw true }})
							} catch (e) {
								if (e===true) return true
								throw e
							}
							return false
						}
					}
					// an object permit to have a filter by req param 
					else { 
						return filter_object(def,field)
					}
					break
				default: { throw Error('Unsupported filter definition') }
			}
		}
	}
	
	function build_filter_root(default_field) {
		return function (def) {
			switch (typeof def) {
				case 'boolean': 
				case 'function':
				case 'string': { return build_filter(default_field)(def) }
				case 'object':
					// a regex is used to match field
					if (def instanceof RegExp){ return build_filter(default_field)(def) }
					// if its an array, the filter is ok if any of the element is ok
					if (def instanceof Array) { return build_filter(default_field)(def) }
					// an object permit to have a filter by req param 
					return filter_object(def)
				default: { throw Error('Unsupported filter definition') }
			}
		}
	}
	
	var root_filter = build_filter_root(default_field)
	
	return {
		root_filter : root_filter,
		not : function (def) {
			var f = root_filter(def)
			return function(v) {
				return ! f(v)
			}
		}
	}
}
