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
 
var verifier = require('../lib/verifier.js');

var db = { }

var _moment = {},
	moment = function(){ return { add : _moment.add} }

var biz = require('../lib/biz.js')(db, moment);

exports['should check login'] = function (test) {
	
	var validator = {},
		mapping = {}
	
	var b = biz.build(validator,mapping)
	
	b.login({l: 'lelogin', p: 'le password'}, function() { })
	
	test.done()
}
