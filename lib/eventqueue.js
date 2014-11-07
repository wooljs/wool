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
     * a Queue of events
     * 
     * projector: an array of function to apply on every pushed event
     */
    function Queue(projector) { this.proj = projector }
    /**
     * push an event in the queue
     * 
     * e: the event to pushed 
     */
    Queue.prototype.push = function(e) { Object.freeze(e); this.proj.forEach(function(p) { p(e) }) }
    /*-*/
        
    /**
     * a Dispatcher of events
     * 
     * $: a validation function, return true is the event is to be dispatched
     * _: a projection function, called on dispatched events 
     */
    function Dispatcher($, _) { this.$ = $; this._ = _ }
    /**
     * 
     * e: the event to pushed 
     */
    Dispatcher.prototype.dispatch = function (e) { if (this.$(e)) this._(e) }
    /*-*/
    
    function evq() {
        var projector = Array.prototype.slice.call(arguments).map(function (p) {
                        
            function parse_projector(projK) {
                return function(cb) {
                    return function(p) {
                        if (projK in p && typeof p[projK] === 'function') {
                            return cb(p, projK)
                        }
                        return undefined
                    }
                }
            }
            
            function no_validator() {
                return function(p, projK) {
                    return p[projK]
                }
            }
            
            function parse_validator(valK) {
                return function(p, projK) {
                    if (valK in p && typeof p[valK] === 'function') {
                        return Dispatcher.prototype.dispatch.bind(new Dispatcher(p[valK], p[projK]))
                    }
                    return undefined
                }
            }
            
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
        })
        return new Queue(projector)
    }
    
    evq.Queue = Queue
    evq.Dispatcher = Dispatcher

    return evq
}
