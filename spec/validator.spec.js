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
V = require( __dirname + '/../lib/validator.js')()

describe("build a Validator with", function() {
    it("empty definition validator is truthy", function() {
        validator = V()
        expect(validator()).toEqual(true)
        expect(validator(undefined)).toEqual(true)
        expect(validator({})).toEqual(true)
        expect(validator({a: 1, b: 2})).toEqual(true)
        expect(/\{\s*return true\s*\}$/.test(validator.toString())).toEqual(true)
    });
    
    it("definition of type undefined is truthy", function() {
        validator = V(undefined)
        expect(validator()).toEqual(true)
        expect(validator(undefined)).toEqual(true)
        expect(validator({})).toEqual(true)
        expect(validator({a: 1, b: 2})).toEqual(true)
        expect(/\{\s*return true\s*\}$/.test(validator.toString())).toEqual(true)
    });
    
    it("definition of type function is indentity", function() {
        function f() {}
        validator = V(f)
        expect(validator).toEqual(f)
    });
    
    describe("definition of type object with a key and value ", function() {
        it("is true", function() {
            var def = {
                a_key: true
            }
            validator = V(def)
            expect(validator({a_key: true})).toEqual(true)
            expect(validator({a_key: 1})).toEqual(true)
            expect(validator({a_key: 'plop'})).toEqual(true)
            expect(validator({a_key: { other_key : 'paf'}})).toEqual(true)
            expect(validator({a_key: []})).toEqual(true)
            expect(validator({ other_key : 'paf'})).toEqual(false)
        });
        
        it("of type string is of form '=val'", function() {
            var def = {
                a_key: '=plop'
            }
            validator = V(def)
            expect(validator({a_key: true})).toEqual(false)
            expect(validator({a_key: 1})).toEqual(false)
            expect(validator({a_key: 'plop'})).toEqual(true)
            expect(validator({a_key: { other_key : 'paf'}})).toEqual(false)
            expect(validator({a_key: []})).toEqual(false)
            expect(validator({ other_key : 'paf'})).toEqual(false)
        });
        
        it("of type string is 'boolean'", function() {
            var def = {
                a_key: 'boolean',
            }
            validator = V(def)
            expect(validator({a_key: true})).toEqual(true)
            expect(validator({a_key: 1})).toEqual(false)
            expect(validator({a_key: 'plop'})).toEqual(false)
            expect(validator({a_key: { other_key : 'paf'}})).toEqual(false)
            expect(validator({a_key: []})).toEqual(false)
            expect(validator({ other_key : 'paf'})).toEqual(false)
        });
        
        it("of type string is 'number'", function() {
            var def = {
                a_key: 'number',
            }
            validator = V(def)
            expect(validator({a_key: true})).toEqual(false)
            expect(validator({a_key: 1})).toEqual(true)
            expect(validator({a_key: 'plop'})).toEqual(false)
            expect(validator({a_key: { other_key : 'paf'}})).toEqual(false)
            expect(validator({a_key: []})).toEqual(false)
            expect(validator({ other_key : 'paf'})).toEqual(false)
        });
        
        it("of type string is 'string'", function() {
            var def = {
                a_key: 'string',
            }
            validator = V(def)
            expect(validator({a_key: true})).toEqual(false)
            expect(validator({a_key: 1})).toEqual(false)
            expect(validator({a_key: 'plop'})).toEqual(true)
            expect(validator({a_key: { other_key : 'paf'}})).toEqual(false)
            expect(validator({a_key: []})).toEqual(false)
            expect(validator({ other_key : 'paf'})).toEqual(false)
        });
        
        it("of type string is 'object'", function() {
            var def = {
                a_key: 'object',
            }
            validator = V(def)
            expect(validator({a_key: true})).toEqual(false)
            expect(validator({a_key: 1})).toEqual(false)
            expect(validator({a_key: 'plop'})).toEqual(false)
            expect(validator({a_key: { other_key : 'paf'}})).toEqual(true)
            expect(validator({a_key: []})).toEqual(true)
            expect(validator({ other_key : 'paf'})).toEqual(false)
        });
        
        it("of type string is 'array'", function() {
            var def = {
                a_key: 'array',
            }
            validator = V(def)
            expect(validator({a_key: true})).toEqual(false)
            expect(validator({a_key: 1})).toEqual(false)
            expect(validator({a_key: 'plop'})).toEqual(false)
            expect(validator({a_key: { other_key : 'paf'}})).toEqual(false)
            expect(validator({a_key: []})).toEqual(true)
            expect(validator({ other_key : 'paf'})).toEqual(false)
        });
        
        it("of type RegExp", function() {
            var def = {
                a_key: /op/,
            }
            validator = V(def)
            expect(validator({a_key: true})).toEqual(false)
            expect(validator({a_key: 1})).toEqual(false)
            expect(validator({a_key: { other_key : 'paf'}})).toEqual(false)
            expect(validator({a_key: []})).toEqual(false)
            expect(validator({ other_key : 'paf'})).toEqual(false)
            
            expect(validator({a_key: 'plip'})).toEqual(false)
            
            expect(validator({a_key: 'plop'})).toEqual(true)
            expect(validator({a_key: 'operand'})).toEqual(true)
            expect(validator({a_key: 'pope'})).toEqual(true)
        });
        
    });
});
