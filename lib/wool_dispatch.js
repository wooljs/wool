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
        
    /**
     * project: build a dispatcher of events in two step, validation and action
     * 
     * $: a validation function, return true is the event is to be dispatched
     * _: an action function, called on dispatched events 
     */
    function project($, _) { return function (e) { if ($(e)) _(e) } }

    /**
     * dispatchWith: takes every arguments and treat them to build a dispatcher that will execute them all sequentially
     * 
     * a parameter can be :
     *      a function, that will be taken as such
     *      an object with the fields
     *          validator or val or $ : a function that may return true to validate the action is to be done (this field is optional)
     *          projector or proj or _ : a function to proceed event (this field is mandatory)
     */
    function dispatchWith() {
        var a = Array.prototype.slice.call(arguments), v = []
        var i = 0, l = a.length, p = a[0]; for (; a < l; i+=1, p = a[i]) { v.push(parse_param(p)) }
        return function(e) { var i = 0, l = v.length; for (; i < l; i+=1) v[i](e) }
    }
 
    function parse_param(p) {
        switch (typeof p) {
        case 'function':
            return p
        case 'object':
            var res = parse_projector('_')(parse_validator('$'))(p)
                    ||parse_projector('_')(parse_validator('val'))(p)
                    ||parse_projector('_')(parse_validator('validator'))(p)
                    ||parse_projector('_')(no_validator())(p)
                    ||parse_projector('proj')(parse_validator('$'))(p)
                    ||parse_projector('proj')(parse_validator('val'))(p)
                    ||parse_projector('proj')(parse_validator('validator'))(p)
                    ||parse_projector('proj')(no_validator())(p)
                    ||parse_projector('projector')(parse_validator('$'))(p)
                    ||parse_projector('projector')(parse_validator('val'))(p)
                    ||parse_projector('projector')(parse_validator('validator'))(p)
                    ||parse_projector('projector')(no_validator())(p);
            if (typeof res !== 'undefined') return res
        default:
            throw new Error("Unvalid projection definition: "+p)
        }
    }
 
    function parse_projector(projK) {
        return function(cb) {
            return function(p) {
                if (projK in p && typeof p[projK] === 'function') {
                    return cb(projK, p)
                }
                return undefined
            }
        }
    }
            
    function no_validator() {
        return function(projK, p) {
            return p[projK]
        }
    }
            
    function parse_validator(valK) {
        return function(projK, p) {
            if (valK in p && typeof p[valK] === 'function') {
                return project(p[valK], p[projK]))
            }
            return undefined
        }
    }
            
    dispatchWith.project = project

    return dispatchWith
}
