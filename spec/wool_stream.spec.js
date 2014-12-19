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
fs = require('fs'),
stream = require('stream'),
util = require('util'),
ws = require( __dirname + '/../lib/wool_stream.js')(util,stream),
file_load = __dirname+"/test_load.db"
file_save = __dirname+"/test_save.db"
;

if (fs.existsSync(file_save)) fs.unlinkSync(file_save)

describe("check stream", function() {

    function TestStream(tf, fl) {
        if (!(this instanceof TestStream)) return new TestStream(tf, fl)
        this.tf = tf
        this.fl = fl
        stream.Transform.call(this, {encoding: 'utf8'})
    }
    util.inherits(TestStream, stream.Transform)
    TestStream.prototype._transform = function (data, encoding, callback) {
        if (typeof this.tf === 'function') this.tf(data,encoding, callback)
        else callback()
    }
    TestStream.prototype._flush = function (callback) {
        if (typeof this.fl === 'function') this.fl(callback)
        else callback()
    }
    
    it("StreamSplit with default separator", function(done) {
        var count = 0
        
        var expected = [
            '{"plip": 0}',
            '{"plop": 42}',
            '{"test": "this is a long text"}',
            '{"a":1, "b":true, "c": [-12, 1, 2, 42], "d":{}, "e":null}'
        ]
                
        fs.createReadStream(file_load, {flags: 'r'})
        .pipe(ws.StreamSplit())
        .pipe(TestStream(function (data, encoding, callback) {
            expect(data.toString()).toEqual(expected[count])
            count += 1
            this.push(data)
            callback()
        }))
        .on('finish', function () {
            expect(count).toEqual(4)
            done()
        })
        
    });
});
