/*
 * Copyright 2017 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
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
    , RuleDispatch = require('./RuleDispatch')

  function Wool() {
    if (!(this instanceof Wool)) return new Wool()
    this._store =
    this._rule =
    this._logger =
    this.src =
    this.dest =
    this._onLoad =
    this._isLoaded =
    this._onReady =
    this._isReady =
    this._stream =
    undefined
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
    if (!(this._store instanceof Store)) this._store = Store()
    this._rule = new Rule(rule, this._store)
    return this
  }
  Wool.prototype.logger = function(logger) {
    if (typeof this._logger === 'undefined') {
      this._logger = logger || console
    }
    if (logger) return this
    return this._logger
  }
  Wool.prototype.fromFile = function(file) {
    return this.fromStream(fs.createReadStream(file, {flags: 'r'}))
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
    .onLoad(function(count) {
      this._store_events()
      if (typeof this._onReady === 'function') { this._onReady(count) } else { this._isReady = true }
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
  Wool.prototype._buildErrorHandler = function(str) {
    return function(e) { this.logger().error(str, e) }.bind(this)
  }

  Wool.prototype.eventReplay = function() {
    return new RuleDispatch(this._rule)
  }
  Wool.prototype.commandExecutor = function() {
    return this.eventReplay()
  }

  Wool.prototype._load_events = function() {
    var evc = wool_stream.EventCount()
    if (! (this.src instanceof stream.Readable)) throw new Error('Wool.fromFile or Wool.fromStream must be called before loading.')
    this.src
    .on('error', this._buildErrorHandler('While reading:'))
    .pipe(wool_stream.StreamSplit().on('error', this._buildErrorHandler('While spliting:')))
    .pipe(wool_stream.EventParse().on('error', this._buildErrorHandler('While parsing:')))
    .pipe(this.eventReplay().on('error', this._buildErrorHandler('While replaying events:')))
    .pipe(evc.on('error', this._buildErrorHandler('While counting:')))
    .on('data', function() { /* this empty function maintain the stream flowing */ })
    .on('finish', function() { if ('_onLoad' in this) { this._onLoad(evc.count()) } else { this._isLoaded = true } }.bind(this))
    return this
  }
  Wool.prototype._store_events = function() {
    this._stream = this.commandExecutor()
    if (! (this.dest instanceof stream.Writable)) throw new Error('Wool.toFile or Wool.toStream must be called before storing.')
    this._stream
    .on('error', this._buildErrorHandler('While writing:'))
    .pipe(wool_stream.EventStringify().on('error', this._buildErrorHandler('While stringifying:')))
    .pipe(wool_stream.StreamJoin().on('error', this._buildErrorHandler('While joining:')))
    .pipe(this.dest.on('error', this._buildErrorHandler('On Destination')))
    return this
  }

  Wool.stream = wool_stream

  return Wool
}())
