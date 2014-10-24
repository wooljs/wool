/*
 * Copyright 2014 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *      
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

var
Validator = require( __dirname + '/../lib/validator.js')()

describe("build a Validator with", function() {
    it("empty definition validator is truthy", function() {
        validator = Validator.build()
        expect(validator()).toEqual(true)
        expect(validator(undefined)).toEqual(true)
        expect(validator({})).toEqual(true)
        expect(validator({a: 1, b: 2})).toEqual(true)
        expect(/\{\s*return true\s*\}$/.test(validator.toString())).toEqual(true)
    });
    
    it("definition of type undefined validator is truthy", function() {
        validator = Validator.build(undefined)
        expect(validator()).toEqual(true)
        expect(validator(undefined)).toEqual(true)
        expect(validator({})).toEqual(true)
        expect(validator({a: 1, b: 2})).toEqual(true)
        expect(/\{\s*return true\s*\}$/.test(validator.toString())).toEqual(true)
    });
    
    it("definition of type function validator is truthy", function() {
        function f() {}
        validator = Validator.build(f)
        expect(validator).toEqual(f)
    });
});
