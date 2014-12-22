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

module.exports = function (fs, stream, wool_stream, wool_dispatch) {
    "use strict"

    function Wool(options) {
        if (!(this instanceof Wool)) return new Wool(options)
        if (typeof options !== 'undefined') {
            if(typeof options !== 'object') {
                throw new Error("Usage : Wool({... options ...})\noptions:\n"+
                "\tdispatch:\t"+wool_dispatch.doc+"\n"+
                "\t"+"\n")
            }
            if ('dispatch' in options) this.dispatch(options.dispatch)
        }
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
                        return wool_dispatch.apply(null, dispatch)
                    } else {
                        return wool_dispatch(dispatch) 
                    }
                } catch (e) {                    
                    throw new Error("Error while parsing dispatch Wool({dispatch:"+JSON.stringify(dispatch)+", ...}): "+e.toString());
                }
            default:
                throw new Error("Illegal option Wool({dispatch:"+JSON.stringify(dispatch)+", ...})");
            }
        })(dispatch);
        return this;
    }
    Wool.prototype.fromFile = function(file) {
        return this.fromStream(fs.createReadStream(file, {flags: 'a+'}));
    }
    Wool.prototype.fromStream = function(s) {
        if (! (s instanceof stream.Readable)) throw new Error("Given input stream must be a Readable")
        this.src = s
        return this;
    }
    Wool.prototype.load = function() {
        var sd = wool_stream.StreamDispatch(this._dispatch)
        if (! ('src' in this)) throw new Error("Wool.fromFile or Wool.fromStream must be called before loading.")
        this.src
        .pipe(wool_stream.StreamSplit())
        .pipe(wool_stream.JsonParse())
        .pipe(sd)
        .on('finish', function() { if ('_onLoad' in this) { this._onLoad() } else { this._isLoaded = true } }.bind(this))
        .on('error', function(e) {console.trace(e)})
        return this;
    }
    Wool.prototype.onLoad = function(onLoad) {
        this._onLoad = onLoad
        if (this._isLoaded) this._onLoad()
        return this;
    }
    Wool.prototype.toFile = function(file) {
        return this.toStream(fs.createWriteStream(file, {flags: 'a'}));
    }
    Wool.prototype.withFile = function(file) {
        this.fromFile(file)
        this.toFile(file)
        return this
    }
    Wool.prototype.toStream = function(s) {
        if (! (s instanceof stream.Writable) && ! (s instanceof stream.Duplex) && ! (s instanceof stream.Transform)) throw new Error("Given output stream must be a Writable")
        this.dest = s
        return this;
    }
    Wool.prototype.store = function() {
        this._stream = wool_stream.StreamDispatch(this._dispatch)
        if (! ('dest' in this)) throw new Error("Wool.toFile or Wool.toStream must be called before storing.")
        this._stream
        .pipe(wool_stream.JsonStringify())
        .pipe(wool_stream.StreamJoin())
        .pipe(this.dest)
        return this;
    }    
    Wool.prototype.run = function() {
        this.load()
        .onLoad(function() {
            this.store()
            if ('_onReady' in this) { this._onReady() } else { this._isReady = true }
        }.bind(this))
        
        return this;
    }
    Wool.prototype.onReady = function(onReady) {
        this._onReady = onReady
        if (this._isReady) this._onReady()
        return this;
    }
    Wool.prototype.push = function(evt) {
        this._stream.write(evt)
    }
    Wool.prototype.pushStream = function() {
        return new wool_stream.PushStream(this)
    }
    
    Wool.stream = wool_stream,
    Wool.dispatch = wool_dispatch
    
    return Wool
}
