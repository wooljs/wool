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

var counter = require('../lib/counter.js');

exports['should count'] = function (test) {
	
	var c = counter.build();
	
	test.equal(c.check(), 0);
	test.equal(c.check(), 0);
	
	c.inc();
	test.equal(c.check(), 1);
	
	c.inc();
	test.equal(c.check(), 2);
	
	test.done();
}

