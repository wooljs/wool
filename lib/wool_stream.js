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

module.exports = function (util, stream) {
    "use strict"
    
    var exports = {}
    
    function isCharCode(s) { return typeof s === 'number' && s > 0 && s < 0x10FFFF}
    
    /**
     * StreamSplit : a Stream of type Transform that split incoming string with a given separator
     * 
     * sep : the separator, a string or a numeric charcode or an array of numeric charcode, default to '\n' if nothing is provided
     */
    function StreamSplit(sep) {
        if (!(this instanceof StreamSplit)) return new StreamSplit(sep)
        this.lastLine = ''
        if (typeof sep === 'string') {
            this.sep = []
            for (var i = 0, l = sep.length; i < l; i+=1) {
                this.sep.push(sep.charCodeAt(i))
            }
        } else if (isCharCode(sep)) {
            this.sep = [sep]
        } else if (typeof s === 'number') {            
            throw new Error("Bad separator: "+ JSON.stringify(sep)+"  is not a valid charcode.")
        } else if (util.isArray(sep)) {
            if (sep.every(isCharCode)) {
                this.sep = sep
            } else {
                throw new Error("Bad separator: "+ JSON.stringify(sep)+", every element should be valid charcode.")
            }
        } else {
            this.sep = [0x0A]
        }
        stream.Transform.call(this, {encoding: 'utf8'})
    }
    util.inherits(StreamSplit, stream.Transform)
    StreamSplit.prototype._transform = function (data, encoding, callback) {
        var p, c, l; p = c = 0; l = data.length;
        while (c < l) {
            while (c < l && data[c] !== this.sep[0]) { c+=1 }
            var i = 0, m = this.sep.length;
            while(i < m && data[c+i] === this.sep[i]) {
                 i += 1
            }
            if (i === m) {
                this.lastLine += data.toString('utf8',p,c)
                this.push(this.lastLine)
                this.lastLine = ''
                c+=i
                p = c
            }
        }
        callback()
    }
    StreamSplit.prototype._flush = function (callback) {
        if (this.lastLine.length > 0) this.push(this.lastLine)
        callback()
    }
    exports.StreamSplit = StreamSplit
    
    /**
     * StreamJoin : a Stream of type Transform that join incoming string with a given separator
     * 
     * sep : the separator, a string, default to '\n' if nothing is provided
     */
    function StreamJoin(sep) {
        if (!(this instanceof StreamJoin)) return new StreamJoin()
        this.sep = sep || '\n'
        stream.Transform.call(this, {encoding: 'utf8'})
    }
    util.inherits(StreamJoin, stream.Transform)
    StreamJoin.prototype._transform = function(data, encoding, callback) {
        this.push(data)
        this.push(this.sep)
        callback()
    }
    exports.StreamJoin = StreamJoin

    /**
     * JsonParse : a Stream of type Transform that parse incoming string data and pipe out parsed object
     */
    function JsonParse() {
        if (!(this instanceof JsonParse)) return new JsonParse()
        stream.Transform.call(this, {objectMode: true})
    }
    util.inherits(JsonParse, stream.Transform)
    JsonParse.prototype._transform = function (data, encoding, callback) {
        this.push(JSON.parse(data.toString()))
        callback()
    }
    exports.JsonParse = JsonParse

    /**
     * JsonStringify : a Stream of type Transform that stringify incoming object data an pipe out stringified object
     */
    function JsonStringify() {
        if (!(this instanceof JsonStringify)) return new JsonStringify()
        stream.Transform.call(this, {objectMode: true})
    }
    util.inherits(JsonStringify, stream.Transform)
    JsonStringify.prototype._transform = function (data, encoding, callback) {
        this.push(JSON.stringify(data))
        callback()
    }
    exports.JsonStringify = JsonStringify

    /**
     * StreamDispatch : a Stream of type Transform that call a dispatcher on its incoming content
     * 
     * dispatcher : a function that take an object and eventually return an object or modify it. If an object is provided it will be piped out  
     */
    function StreamDispatch(dispatcher) {
        if (!(this instanceof StreamDispatch)) return new StreamDispatch(dispatcher)
        this.dispatcher = dispatcher
        stream.Transform.call(this, {objectMode: true})
    }
    util.inherits(StreamDispatch, stream.Transform)
    StreamDispatch.prototype._transform = function (data, encoding, callback) {
        var res = this.dispatcher(data)
        if (typeof res !== 'undefined') data = res;
        this.push(data)
        callback()
    }
    exports.StreamDispatch = StreamDispatch
    
    return exports
}
