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

const fs = require('fs')
  , { Readable, Writable, Duplex, Transform } = require('stream')
  , { AsyncMapStream, CountStream, StreamSplit, StreamJoin, StreamParse, StreamStringify, PushStream } = require('wool-stream')
  , { Event } = require('wool-model')
  , { RuleEngine } = require('wool-rule')
  , Store = require('wool-store').Store

class Wool {
  constructor() {
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
  static build() {
    return new Wool()
  }

  /*
   * Public methods
   */
  store(store) {
    if (! (store instanceof Store)) throw new Error(store+' is not an instance of Store.')
    this._store = store
    return this
  }
  rule(rules) {
    if (!this._store) throw new Error('Store is not set, please call store method first.')
    if (!(this._rule instanceof RuleEngine)) this._rule = new RuleEngine(this._store)
    this._rule.addRules(rules)
    return this
  }
  logger(logger) {
    if (typeof this._logger === 'undefined') {
      this._logger = logger || console
    }
    if (logger) return this
    return this._logger
  }
  fromFile(file) {
    return this.fromStream(fs.createReadStream(file, {flags: 'r'}))
  }
  fromStream(s) {
    if (! (s instanceof Readable)) throw new Error('Given input stream must be a Readable')
    this.src = s
    return this
  }
  onLoad(onLoad) {
    this._onLoad = onLoad
    if (this._isLoaded) this._onLoad()
    return this
  }
  toFile(file) {
    return this.toStream(fs.createWriteStream(file, {flags: 'a'}))
  }
  withFile(file) {
    this.fromFile(file)
    this.toFile(file)
    return this
  }
  toStream(s) {
    if (! (s instanceof Writable) && ! (s instanceof Duplex) && ! (s instanceof Transform)) throw new Error('Given output stream must be a Writable')
    this.dest = s
    return this
  }
  run() {
    this._load_events()
    .onLoad(function(count) {
      this._store_events()
      if (typeof this._onReady === 'function') { this._onReady(count) } else { this._isReady = true }
    }.bind(this))
    return this
  }
  onReady(onReady) {
    this._onReady = onReady
    if (this._isReady) this._onReady()
    return this
  }
  push(evt) {
    this._stream.write(evt)
  }
  end(evt) {
    this._stream.end(evt)
  }
  pushStream() {
    return new PushStream(this)
  }

  /*
   * Private methods
   */
  _buildErrorHandler(str) {
    return function(e) { this.logger().error(str, e) }.bind(this)
  }
  _onRuleError() {
    return function(data) {
      if (data.s === 'I') this.logger().warn('%s, with %s', data.m, data.toString())
      if (data.s === 'E') this.logger().error('%s, with %s', data.m, data.toString())
    }.bind(this)
  }
  eventReplay() {
    return AsyncMapStream(async e => this._rule.replay(e))
  }
  commandExecutor() {
    return AsyncMapStream(async e => this._rule.execute(e))
  }

  _load_events() {
    var evc = CountStream()
    if (! (this.src instanceof Readable)) throw new Error('Wool.fromFile or Wool.fromStream must be called before loading.')
    this.src
    .on('error', this._buildErrorHandler('While reading:'))
    .pipe(StreamSplit().on('error', this._buildErrorHandler('While spliting:')))
    .pipe(StreamParse(Event.parse).on('error', this._buildErrorHandler('While parsing:')))
    .pipe(this.eventReplay().on('error', this._buildErrorHandler('While replaying events:')))
    .pipe(evc.on('error', this._buildErrorHandler('While counting:')))
    .on('data', function() { /* this empty function maintain the stream flowing */ })
    .on('finish', function() { if ('_onLoad' in this) { this._onLoad(evc.count()) } else { this._isLoaded = true } }.bind(this))
    return this
  }
  _store_events() {
    this._stream = this.commandExecutor()
    if (! (this.dest instanceof Writable)) throw new Error('Wool.toFile or Wool.toStream must be called before storing.')
    this._stream
    .on('error', this._buildErrorHandler('While writing:'))
    .pipe(StreamStringify(Event.stringify).on('error', this._buildErrorHandler('While stringifying:')))
    .pipe(StreamJoin().on('error', this._buildErrorHandler('While joining:')))
    .pipe(this.dest.on('error', this._buildErrorHandler('On Destination')))
    return this
  }

}

module.exports = Wool.build
