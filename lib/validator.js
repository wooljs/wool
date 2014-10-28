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
   
module.exports = function () {
    "use strict"
    
    var truthy = function() { return true }

    /**
     * Validator.build
     * 
     * Build a validator function from parameter.
     * 
     *  definition :
     *      will be parsed to provide the validator function. definition can be :
     *      - undefined:
     *          a function that always return true is returned
     *      - function:
     *          the function is returned as is. It shall takes an object as parameter that return true if it is conform to this type of definition
     *      - object:
     *          a validation function will be built with the following rules 
     *              - key: represents a mandatory field with constraint on value
     *              - value: can be
     *                  - true to check that the key exists (no type checking)
     *                  - false to reject if the key exists (no type checking)
     *                  - a numeric value that has to be matched
     *                  - a string starting with '=' followed by a string to match (eg: '=toto')
     *                  - a string in these values 'boolean', 'number', 'string' or 'object' that will be tested using simple typeof
     *                  - a string with value 'array' that will check the value is an array
     *                  - a regex that test the value
     *                  - a function that validate the value (check Validator API to provide helper)
     */
    function Validator(definition) {
        var type = typeof definition
        switch (type) {
        case 'undefined':
            return truthy
        case 'function':
            return definition;
        case 'object': {
            var v = Object.keys(definition).map(function(k) {
                if (definition[k] === true) {
                    return function(e) { return k in e }
                }
                if (definition[k] === false) {
                    return function(e) { return ! (k in e) }
                }
                if (typeof definition[k] === 'number') {
                    var v = definition[k]
                    return function(e) { return (k in e) && e[k] === v }
                }
                if (typeof definition[k] === 'string') {
                    if (definition[k].indexOf('=') === 0) {
                        var s = definition[k].substring(1)
                        return function(e) { return (k in e) && e[k] === s }
                    }
                    if (['boolean', 'string', 'number','object'].indexOf(definition[k]) !== -1 ) {
                        var t = definition[k]
                        return function(e) { return (k in e) && typeof e[k] === t  }
                    }
                    if (definition[k] === 'array') {
                        return function(e) { return (k in e) && typeof e[k] === 'object' && e[k] instanceof Array }
                    }
                }
                if (typeof definition[k] === 'function') {
                    var f = definition[k]
                    return function(e) { return (k in e) && f(e[k])  }
                }
                if (typeof definition[k] === 'object') {
                    if (definition[k] instanceof RegExp) {
                        var rx = definition[k]
                        return function(e) { return (k in e) && typeof e[k] === 'string' && rx.test(e[k]) }
                    }
                }
            })
            return function(e) {
                return v.every(function (f) { return f(e) }) 
            }
        }
        default:
            throw new Error("Unknown Validator.build definition of type: '"+type+"'")
        }
    }
    
    /**
     * Validator.and
     * 
     * create a validator that is true if every validator passed as parameter return true.
     */
    Validator.and = function () {
        var v = Array.prototype.slice.call(arguments).map(Validator)
        return function(e) {
            return v.every(function (f) { return f(e) }) 
        }
    }

    /**
     * Validator.or
     * 
     * create a validator that is true if at least one validator in the parameter passed return true.
     */
    Validator.or = function () {
        var v = Array.prototype.slice.call(arguments).map(Validator)
        return function(e) {
            return v.some(function (f) { return f(e) }) 
        }
    }
    
    return Validator
}