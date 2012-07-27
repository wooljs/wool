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

var str_to_obj = require('../lib/str_to_obj.js')(require('fs'),require('pegjs'))

exports['should reject non string'] = function (test) {
	test.throws(function() { str_to_obj(0) })
	test.throws(function() { str_to_obj(42) })
	test.throws(function() { str_to_obj(function() {}) })
	test.throws(function() { str_to_obj({}) })
	test.throws(function() { str_to_obj([]) })
	test.done()
}

exports['should reject non representing object string'] = function (test) {
	test.throws(function() { str_to_obj("42") })
	test.throws(function() { str_to_obj("plop") })
	test.throws(function() { str_to_obj("function() {}") })
	test.throws(function() { str_to_obj("[]") })
	test.done()
}

function test_template(param,expected) {
	exports['should parse '+param+' as object string'] = function (test) {
		var res = str_to_obj(param)
		test.deepEqual(res, expected)
		test.done()
	}
}

test_template(new String("{}"),{})
test_template(new String("{}\n"),{})
test_template('{"a":1}',{a:1})
test_template("{a:1}",{a:1})
test_template('{"a0":1}',{a0:1})
test_template("{$a0:1}",{$a0:1})
test_template('{"a":1,"b":[12,"plop"]}',{a:1,b:[12,'plop']})
test_template('{a:1,b:[12,"plop"]}',{a:1,b:[12,'plop']})
test_template("{a:1,b:[12,'plop']}",{a:1,b:[12,'plop']})
test_template("{a:1,/* comment 1 bla */\n// comment 2 plop\n b:[12,'plop']}",{a:1,b:[12,'plop']})

;(function () {
	var param = "{a:1,f:function(x){return x+1}}",
		expected = {a:1,f:function(x){return x+1}}
		
	exports['should parse '+param+' as object string'] = function (test) {
		console.log("plop")
		
		var res = str_to_obj(param)
		
		console.log(res)
		
		test.equal(res.a, expected.a)
		test.equal(res.f.toString(), expected.f.toString())
		test.done()
	}
})()
