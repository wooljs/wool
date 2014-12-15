/*
 * Copyright 2013 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *      
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

module.exports = function (fs, wool_stream, wool_dispatch) {
    "use strict"

    var export = {
        stream : wool_stream,
        dispatch : wool_dispatch
    }
    
    function Wool(dispatcher) {
        if (arguments.length > 1) dispatcher = wool_dispatch.apply(null, arguments)
        if (!(this instanceof StreamDispatch)) return new Wool(dispatcher)
        this.stream = wool_stream.StreamDispatch(dispatcher)
    }
    Wool.prototype.withFile = function(file) {
        this.file = file
        this.from(fs.createReadStream(file, {flags: 'r'}))
    }
    Wool.prototype.from = function(stream) {
        stream
        .pipe(wool_stream.StreamSplit())
        .pipe(wool_stream.JsonParse())
        .pipe(this.stream)
        .on('finish', this.ready.bind(this))
    }
    
    Wool.prototype.onReady = function(then) { this.then = then }
    Wool.prototype.ready = function() {
        this.stream
        .pipe(wool_stream.JsonStringify())
        .pipe(wool_stream.StreamJoin())
        .pipe(fs.createWriteStream(this.file, { flags: 'a',  mode: 0666 }))
    }
        
    Wool.stream = wool_stream,
    Wool.dispatch = wool_dispatch
    
    return Wool
}
