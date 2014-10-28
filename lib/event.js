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
     * 
     */
    function EventStore() {
        this.defs = {}
        this.events = []
    }
    EventStore.prototype = {}
    
    /**
     * 
     */
    EventStore.prototype.

    /**
     * Definition of an Event
     * 
     *  name: denominates the type of event covered by this definition
     *  projections: is either
     *      - function: a closure that can receive an event and perform an action (aka a projection) on an external state
     *      - array: contains closures that can receive the same event and perform parallel actions
     *      Remark: EventDefinition does know nothing of external state, you should use closure 
     *  validator: is either
     *      - undefined:
     *          accept any event with no format validation
     *      - function:
     *          takes an event as parameter that return true if it is conform to this type of definition
     */
    function EventDefinition(name, projections, validator) {
        this.name = name;
        this.projections = typeof projections === 'function' ? [projections] : ( projections instanceof Array ? projections : [] ) ;
        this.validator = validator;
    }
    EventDefinition.prototype = {}
    
    /**
     * 
     * e: event
     */
    EventDefinition.prototype.dispatch = function (e) {
        if (this.validator(e)) { this.projections.forEach(function (f) { f(e) } }
    }
    
 
    

    /**
     * Constructor for Event
     * 
     * ts : timestamp of the event
     * t : type of the event
     * d : data of the event
     */
    function Event(ts, t, d) { this.ts = ts; this.t = t; this.d = d }
    Event.prototype = {}
    
    /**
     * Serialize the event
     */
    Event.prototype.serialize = function() { return JSON.stringify(this) }
    
    /**
     * Unserialize an String representing an event and bind it to Event Type
     */
    unserialize = function(e) { r = JSON.parse(e); r.prototype = Event.prototype; return r }
    
    return {
        unserialize: 
        Event : Event,
        Starter : Starter
    }
}
