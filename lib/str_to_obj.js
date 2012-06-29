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
 
module.exports = function (vm) {
	return function (str, sandbox) {
		if ((typeof str === 'string' || (typeof str === 'object' && str instanceof String)) && str.match(/^\s*\{[\s\S]*\}\s*$/)) {
			sandbox = sandbox || {}
			sandbox.console = console
			sandbox.require = require
			str = "var res = (function() {return "+str+"})()"
			vm.runInNewContext(str, sandbox)
			return sandbox.res
		} else {
			throw Error("Not a string representing an object: "+ str)
		}
	}
}
 
