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
 
/**
 * (filter) -> {
 * 		chain: (rules) -> (req,res) -> .
 * 		rule: (def, action) -> {
 * 			valid: (req) -> boolean
 * 			run: (req,res) -> .
 * 		}
 * }
 */
exports.inject = function (root_filter) {
	return {
		chain : function (rules) {
			return function (req, res) {
				// run every rules to find the first matching rule
				for (i = 0, l = rules.length; i < l ; i++) {
					var o = rules[i];
					// if o is a valid rule we run it then break the flow
					if (o.valid(req)) {
						o.run(req,res);
						break;
					}
				}
			}
		}
		,
		rule : function (def, action) {
			return {
				'valid': (typeof def === 'function') ? def : root_filter(def),
				'run': action
			}
		}
	}
}
