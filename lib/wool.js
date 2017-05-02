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

module.exports = (function () {
  'use strict'
  var fs = require('fs')
    , stream = require('stream')
    , wool_stream = require('wool-stream')
    , Rule = require('wool-rule')
    , Store = require('wool-store')

  function Wool() {
    if (!(this instanceof Wool)) return new Wool()
  }
  /*
   * Public methods 
   */
  Wool.prototype.store = function(store) {
    if (! (store instanceof Store)) throw new Error(store+' is not an instance of Store.')
    this._store = store
    return this
  }
  Wool.prototype.rule = function(rule) {
    if (!('_store' in this)) this._store = Store()
    this._rule = new Rule(rule, this._store)
    this._dispatch = function(data, cb) {
      console.log(data.n)
      this._rule.push(data, cb)
    }.bind(this)
    return this
  }
  Wool.prototype.fromFile = function(file) {
    return this.fromStream(fs.createReadStream(file, {flags: 'a+'}))
  }
  Wool.prototype.fromStream = function(s) {
    if (! (s instanceof stream.Readable)) throw new Error('Given input stream must be a Readable')
    this.src = s
    return this
  }
  Wool.prototype.onLoad = function(onLoad) {
    this._onLoad = onLoad
    if (this._isLoaded) this._onLoad()
    return this
  }
  Wool.prototype.toFile = function(file) {
    return this.toStream(fs.createWriteStream(file, {flags: 'a'}))
  }
  Wool.prototype.withFile = function(file) {
    this.fromFile(file)
    this.toFile(file)
    return this
  }
  Wool.prototype.toStream = function(s) {
    if (! (s instanceof stream.Writable) && ! (s instanceof stream.Duplex) && ! (s instanceof stream.Transform)) throw new Error('Given output stream must be a Writable')
    this.dest = s
    return this
  }
  Wool.prototype.run = function() {
    this._load_events()
    .onLoad(function() {
      this._store_events()
      if ('_onReady' in this) { this._onReady() } else { this._isReady = true }
    }.bind(this))
    return this
  }
  Wool.prototype.onReady = function(onReady) {
    this._onReady = onReady
    if (this._isReady) this._onReady()
    return this
  }
  Wool.prototype.push = function(evt) {
    this._stream.write(evt)
  }
  Wool.prototype.end = function(evt) {
    this._stream.end(evt)
  }
  Wool.prototype.pushStream = function() {
    return new wool_stream.PushStream(this)
  }

  /*
   * Private methods 
   */
  Wool.prototype._load_events = function() {
    var sd = wool_stream.StreamDispatch(this._dispatch)
    if (! ('src' in this)) throw new Error('Wool.fromFile or Wool.fromStream must be called before loading.')
    this.src
    .pipe(wool_stream.StreamSplit())
    .pipe(wool_stream.EventParse())
    .pipe(sd)
    .on('finish', function() { if ('_onLoad' in this) { this._onLoad() } else { this._isLoaded = true } }.bind(this))
    .on('error', function(e) {if ('stack' in e) { console.error(e.stack) } else { console.trace(e) } })
    return this
  }
  Wool.prototype._store_events = function() {
    this._stream = wool_stream.StreamDispatch(this._dispatch)
    if (! ('dest' in this)) throw new Error('Wool.toFile or Wool.toStream must be called before storing.')
    this._stream
    .pipe(wool_stream.EventStringify())
    .pipe(wool_stream.StreamJoin())
    .pipe(this.dest)
    return this
  }

  Wool.stream = wool_stream

  return Wool
}())
