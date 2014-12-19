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

'use strict'

var
fs = require('fs'),
stream = require('stream'),
util = require('util'),
ws = require( __dirname + '/../lib/wool_stream.js')(util,stream),
file_load = __dirname+"/test_load.db",
file_save = __dirname+"/test_save.db"
;

if (fs.existsSync(file_save)) fs.unlinkSync(file_save)

describe("check stream", function() {

    function TestStream(tf, fl, options) {
        if (!(this instanceof TestStream)) return new TestStream(tf, fl, options)
        this.tf = tf
        this.fl = fl
        options = options || {encoding: 'utf8'}
        stream.Transform.call(this, options)
    }
    util.inherits(TestStream, stream.Transform)
    TestStream.prototype._transform = function (data, encoding, callback) {
        if (typeof this.tf === 'function') {
            try {
                this.tf(data,encoding, callback)
            } catch(e) {
                callback(e)
            }
        } else {
            try {
                this.push(data)
                callback()
            } catch(e) {
                callback(e)
            }
        }
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
        .on('error', function (e) {
            console.trace(e)
            done()
        })
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
    
    it("StreamJoin with default separator", function(done) {
        var count = 0
        
        var data = [
            '{"plip": 0}',
            '{"plop": 42}',
            '{"test": "this is a long text"}',
            '{"a":1, "b":true, "c": [-12, 1, 2, 42], "d":{}, "e":null}'
        ]
        var expected = [
            '{"plip": 0}',
            '\n',
            '{"plop": 42}',
            '\n',
            '{"test": "this is a long text"}',
            '\n',
            '{"a":1, "b":true, "c": [-12, 1, 2, 42], "d":{}, "e":null}',
            '\n'
        ]
        var ins = TestStream()
        
        ins
        .pipe(ws.StreamJoin())
        .on('error', function (e) {
            console.trace(e)
            done()
        })
        .pipe(TestStream(function (data, encoding, callback) {
            expect(data).toEqual(expected[count])
            count += 1
            this.push(data)
            callback()
        }, undefined, {objectMode: true}))
        .on('finish', function () {
            expect(count).toEqual(8)
            done()
        })
        
        var i = 0, l = data.length
        for(; i < l; i+=1) {
            ins.write(data[i])
        }
        ins.end()
    });
    
    it("JsonParse", function(done) {
        var count = 0
        
        var data = [
            '{"plip": 0}',
            '{"plop": 42}',
            '{"test": "this is a long text"}',
            '{"a":1, "b":true, "c": [-12, 1, 2, 42], "d":{}, "e":null}'
        ]
        var expected = [
            {plip: 0},
            {plop: 42},
            {"test": "this is a long text"},
            {"a":1, "d":{}, "e":null, "b":true, "c": [-12, 1, 2, 42]}
        ]
        
        var ins = TestStream()
        
        ins
        .pipe(ws.JsonParse())
        .on('error', function (e) {
            console.trace(e)
            done()
        })
        .pipe(TestStream(function (data, encoding, callback) {
            expect(data).toEqual(expected[count])
            count += 1
            this.push(data)
            callback()
        }, undefined, {objectMode: true}))
        .on('finish', function () {
            expect(count).toEqual(4)
            done()
        })
        
        var i = 0, l = data.length
        for(; i < l; i+=1) {
            ins.write(data[i])
        }
        ins.end()
    });
    
    it("JsonStringify", function(done) {
        var count = 0
        
        var data = [
            {plip: 0},
            {plop: 42},
            {"test": "this is a long text"},
            {"a":1, "b":true, "c": [-12, 1, 2, 42], "d":{}, "e":null}
        ]
        var expected = [
            '{"plip":0}',
            '{"plop":42}',
            '{"test":"this is a long text"}',
            '{"a":1,"b":true,"c":[-12,1,2,42],"d":{},"e":null}'
        ]
        
        var ins = TestStream(undefined, undefined, {objectMode: true, paf:"pif"})
        
        ins
        .pipe(ws.JsonStringify())
        .on('error', function (e) {
            console.trace(e)
            done()
        })
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
        
        var i = 0, l = data.length
        for(; i < l; i+=1) {
            ins.write(data[i])
        }
        ins.end()
    });
    
    
    it("StreamDispatch", function(done) {
        var count = 0, index = 0
        
        var data = [
            {plip: 0},
            {plop: 42},
            {"test": "this is a long text"},
            {"a":1, "b":true, "c": [-12, 1, 2, 42], "d":{}, "e":null}
        ]
        var expected = [
            {plip: 0, test: 0},
            {plop: 42, test: 1},
            {test: 2},
            {"a":1, "b":true, "c": [-12, 1, 2, 42], "d":{}, "e":null, test: 3}
        ]
        
        var ins = TestStream(undefined, undefined, {objectMode: true, paf:"pif"})
        
        ins
        .pipe(ws.StreamDispatch(function (o) { o.test = index; index+=1; }))
        .on('error', function (e) {
            console.trace(e)
            done()
        })
        .pipe(TestStream(function (data, encoding, callback) {
            expect(data).toEqual(expected[count])
            count += 1
            this.push(data)
            callback()
        }, undefined, {objectMode: true}))
        .on('error', function (e) {
            console.trace(e)
            done()
        })
        .on('finish', function () {
            expect(count).toEqual(4)
            done()
        })
        
        var i = 0, l = data.length
        for(; i < l; i+=1) {
            ins.write(data[i])
        }
        ins.end()
    });
    
    
    it("all piped together", function(done) {
        var count = 0
        
        fs.createReadStream(file_load, {flags: 'r'})
        .pipe(ws.StreamSplit())
        .pipe(ws.JsonParse())
        .pipe(ws.StreamDispatch(function(d) { count+=1 }))
        .on('error', function (e) {
            console.trace(e)
            done()
        })
        .on('finish', function () {        
            
            var es = ws.StreamDispatch(function(d) { count+=1 })
            var date = new Date()
            
            es
            .pipe(ws.JsonStringify())
            .pipe(ws.StreamJoin())
            .pipe(fs.createWriteStream(file_save, {flags: 'a'}))
            .on('error', function (e) {
                console.trace(e)
                done()
            })
            .on('finish', function () {
                expect(count).toEqual(8)
                
                fs.readFile(file_save,{encoding:'utf8'}, function (err, data) {
                    if (err) throw err;
                    
                    expect(data).toEqual('{"yo":"yeah"}\n42\n"paf"\n{"this is the end":"'+date.toISOString()+'"}\n')
                    
                    fs.unlink(file_save, function(err) {
                        if (err) throw err;
                        done()
                    })
                })
                
            })

            es.write({yo:"yeah"})
            es.write(42)
            es.write("paf")
            es.end({"this is the end":date.toISOString()})
        })
    })
    
});
