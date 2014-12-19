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

    function Wool(options) {
        if (!(this instanceof Wool)) return new Wool(options)
        if (typeof options !== 'object') throw new Error("Usage : Wool({... options ...})\noptions:\n"+
            "\tdispatch:\t"+wool_dispatch.doc+"\n"+
            "\t"+"\n")
        this.dispatch(options.dispatch)
        
        this.stream = wool_stream.StreamDispatch(this._dispatch)
    }
    Wool.prototype.dispatch = function(dispatch) {
        if (arguments.length == 0) return this._dispatch;
        this._dispatch = (function(dispatch) {
            var type = typeof dispatch
            switch(type) {
            case 'undefined':
                return function(){};
            case 'function':
                return dispatch;
            case 'string':
            case 'number':
                throw new Error("Unsupported type "+type+" for option Wool({dispatch:"+JSON.stringify(dispatch)+", ...})")
            case 'object':
                try {
                    if (dispatch instanceof Array) {
                        return wool_dispatch.apply(null, options.dispatch)
                    } else {
                        return wool_dispatch(options.dispatch) 
                    }
                } catch (e) {                    
                    throw new Error("Error while parsing option Wool({dispatch:"+JSON.stringify(dispatch)+", ...}): "+e.toString());
                }
            default:
                throw new Error("Illegal option Wool({dispatch:"+JSON.stringify(dispatch)+", ...})");
            }
        })(dispatch);
        return this;
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
        .pipe(fs.createWriteStream(this.file, {flags: 'a'}))
    }
        
    Wool.stream = wool_stream,
    Wool.dispatch = wool_dispatch
    
    return Wool
}
