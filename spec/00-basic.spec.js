/*
 * Copyright 2013 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *      
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

var wool = require( __dirname + '/../lib/basic.js')()

describe("A suite", function() {
    it("contains spec with an expectation", function() {
        
        var a = {}, b = {};
        
        expect(a._id).not.toBeDefined()
        expect(b._id).not.toBeDefined()
        
        wool.persist(a)
        wool.persist(b)
        
        expect(a._id).toBeDefined()
        expect(b._id).toBeDefined()
        expect(a._id).not.toEqual(b._id)
    });
});
