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


//var load = require( __dirname + '/../lib/load.js')

xdescribe("load utility", function() {
    "use strict"
    var loader = load(require('fs'), require('event-stream'))
    
    it("apply loader on a file", function() {
        var run = false
        var count = 0
        var expected = [{"plip": 0}, {"plop": 42}, {"test": "this is a long text"}, {"a":1, "b":true, "c": [-12, 1, 2, 42], "d":{}, "e":null}]
        
        loader(__dirname +'/test_load.db', function(obj, i) {
            expect(obj).toEqual(expected[i])
            count++
            //console.log('count', count)
            return true
        }, function() {
            //console.log('here')
            run = true
        })
        waitsFor(function() {
            return run;
        }, "The Value should be incremented", 5000);
        
        runs(function() {
            //console.log('here again')
            expect(run).toEqual(true)
            expect(count).toEqual(4)
        })
    });
});
