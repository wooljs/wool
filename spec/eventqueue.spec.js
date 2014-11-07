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
evq = require( __dirname + '/../lib/eventqueue.js')()

describe("build an event queue with", function() {
    "use strict"
    
    describe("one catchall", function() {
        it("function projection", function() {
            var count = 0
            
            var q = evq(function(e) { count++ })
            
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            
            expect(count).toEqual(5)
        });
        
        it("object with projection only with symbol definition", function() {
            var count = 0
            
            var q = evq({
                _: function(e) { count++ }
            })
            
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            
            expect(count).toEqual(5)
        });
        
        it("object with projection only with short definition", function() {
            var count = 0
            
            var q = evq({
                proj: function(e) { count++ }
            })
            
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            
            expect(count).toEqual(5)
        });
        
        it("object with projection only with long definition", function() {
            var count = 0
            
            var q = evq({
                projector: function(e) { count++ }
            })
            
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            
            expect(count).toEqual(5)
        });
        
        
        it("object with truthy validation and projection with symbol definition", function() {
            var count = 0
            
            var q = evq({
                $: function() { return true },
                _: function(e) { count++ }
            })
            
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            
            expect(count).toEqual(5)
        });
        
        it("object with truthy validation and projection with short projector and symbol validator", function() {
            var count = 0
            
            var q = evq({
                $: function() { return true },
                proj: function(e) { count++ }
            })
            
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            
            expect(count).toEqual(5)
        });
        
        it("object with truthy validation and projection with long projector and symbol validator", function() {
            var count = 0
            
            var q = evq({
                $: function() { return true },
                projector: function(e) { count++ }
            })
            
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            
            expect(count).toEqual(5)
        });
        
        
        it("object with truthy validation and projection with symbol projector and short validator", function() {
            var count = 0
            
            var q = evq({
                val: function() { return true },
                _: function(e) { count++ }
            })
            
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            
            expect(count).toEqual(5)
        });
        
        it("object with truthy validation and projection with short projector and short validator", function() {
            var count = 0
            
            var q = evq({
                val: function() { return true },
                proj: function(e) { count++ }
            })
            
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            
            expect(count).toEqual(5)
        });
        
        it("object with truthy validation and projection with long projector and short validator", function() {
            var count = 0
            
            var q = evq({
                val: function() { return true },
                projector: function(e) { count++ }
            })
            
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            
            expect(count).toEqual(5)
        });
        
        
        it("object with truthy validation and projection with symbol projector and long validator", function() {
            var count = 0
            
            var q = evq({
                validator: function() { return true },
                _: function(e) { count++ }
            })
            
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            
            expect(count).toEqual(5)
        });
        
        it("object with truthy validation and projection with short projector and long validator", function() {
            var count = 0
            
            var q = evq({
                validator: function() { return true },
                proj: function(e) { count++ }
            })
            
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            
            expect(count).toEqual(5)
        });
        
        it("object with truthy validation and projection with long projector and long validator", function() {
            var count = 0
            
            var q = evq({
                validator: function() { return true },
                projector: function(e) { count++ }
            })
            
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            q.push({})
            
            expect(count).toEqual(5)
        });
    });
    
    describe("two dispatchers", function() {
        
        it("filtering event of t 'a' and 'b'", function() {
            var count_a = 0, count_b = 0
            
            var q = evq({
                $: function(e) { if (e.t=== 'a') return true },
                _: function(e) { count_a++ }
            },{
                $: function(e) { if (e.t=== 'b') return true },
                _: function(e) { count_b++ }
            })
            
            q.push({t:'a'})
            q.push({})
            q.push({t:'a'})
            q.push({t:'b'})
            q.push({t:'a'})
            
            expect(count_a).toEqual(3)
            expect(count_b).toEqual(1)
        });
    });
});