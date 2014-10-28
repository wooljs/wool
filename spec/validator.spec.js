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
    "use strict"
    it("empty definition validator is truthy", function() {
        var validator = V()
        expect(validator()).toEqual(true)
        expect(validator(undefined)).toEqual(true)
        expect(validator({})).toEqual(true)
        expect(validator({a: 1, b: 2})).toEqual(true)
        expect(/\{\s*return true\s*\}$/.test(validator.toString())).toEqual(true)
    });
    
    it("definition of type undefined is truthy", function() {
        var validator = V(undefined)
        expect(validator()).toEqual(true)
        expect(validator(undefined)).toEqual(true)
        expect(validator({})).toEqual(true)
        expect(validator({a: 1, b: 2})).toEqual(true)
        expect(/\{\s*return true\s*\}$/.test(validator.toString())).toEqual(true)
    });
    
    it("definition of type function is indentity", function() {
        function f() {}
        var validator = V(f)
        expect(validator).toEqual(f)
    });
    
    describe("definition of type object with a key and value ", function() {
        it("is true", function() {
            var def = {
                a_key: true
            }
            var validator = V(def)
            expect(validator({a_key: true})).toEqual(true)
            expect(validator({a_key: 1})).toEqual(true)
            expect(validator({a_key: 'plop'})).toEqual(true)
            expect(validator({a_key: { other_key : 'paf'}})).toEqual(true)
            expect(validator({a_key: []})).toEqual(true)
            expect(validator({ other_key : 'paf'})).toEqual(false)
        });
        
        it("is false", function() {
            var def = {
                a_key: false
            }
            var validator = V(def)
            expect(validator({a_key: true})).toEqual(false)
            expect(validator({a_key: 1})).toEqual(false)
            expect(validator({a_key: 'plop'})).toEqual(false)
            expect(validator({a_key: { other_key : 'paf'}})).toEqual(false)
            expect(validator({a_key: []})).toEqual(false)
            expect(validator({ other_key : 'paf'})).toEqual(true)
        });
        
        it("of type string is of form '=val'", function() {
            var def = {
                a_key: '=plop'
            }
            var validator = V(def)
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
            var validator = V(def)
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
            var validator = V(def)
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
            var validator = V(def)
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
            var validator = V(def)
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
            var validator = V(def)
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
            var validator = V(def)
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
    
    describe("use Validator.and", function() {
        var truthy = function() { return true }
        var falsy = function() { return false }
        
        it("to check multiple conditions", function() {
            var validator = V.and(truthy,truthy)
            expect(validator({})).toEqual(true)
        });
        it("to check multiple conditions", function() {
            var validator = V.and(truthy,falsy)
            expect(validator({})).toEqual(false)
        });
        it("to check multiple conditions", function() {
            var validator = V.and(falsy,truthy)
            expect(validator({})).toEqual(false)
        });
        it("to check multiple conditions", function() {
            var validator = V.and(falsy,falsy)
            expect(validator({})).toEqual(false)
        });
    });
    
    describe("use Validator.or", function() {
        var truthy = function() { return true }
        var falsy = function() { return false }
        
        it("to check multiple conditions", function() {
            var validator = V.or(truthy,truthy)
            expect(validator({})).toEqual(true)
        });
        it("to check multiple conditions", function() {
            var validator = V.or(truthy,falsy)
            expect(validator({})).toEqual(true)
        });
        it("to check multiple conditions", function() {
            var validator = V.or(falsy,truthy)
            expect(validator({})).toEqual(true)
        });
        it("to check multiple conditions", function() {
            var validator = V.or(falsy,falsy)
            expect(validator({})).toEqual(false)
        });
    });
});
