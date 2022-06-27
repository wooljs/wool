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
  , { AsyncMapStream, CountStream, StreamSplit, StreamJoin, StreamParse, StreamStringify, DispatchStream } = require('wool-stream')
  , { Event } = require('wool-model')
  , { RuleEngine } = require('wool-rule')
  , { Store } = require('wool-store')

class WoolError extends Error { }

class Wool {
  constructor(options) {
    let { logger, store, rules, events } = options

    if (!(store instanceof Store)) throw new WoolError(store + ' is not an instance of Store.')
    this.store = store

    if (rules.length === 0) throw new WoolError('Cannot accept empty rules list')
    this.rule = new RuleEngine(this.store)
    this.rule.addRules(rules)

    this.logger = logger || console

    this.splitOut = false

    if (typeof events === 'string') {
      if (events.length === 0) throw new WoolError('Cannot create empty file for db')
      this.src = fs.createReadStream(events, { flags: 'r' })
      this.dest = fs.createWriteStream(events, { flags: 'a' })
    } else if (typeof events === 'object') {
      let { src, dest } = events

      if (typeof src === 'string') this.src = fs.createReadStream(src, { flags: 'r' })
      else if (src instanceof Readable) this.src = src
      else throw new WoolError('Given input stream must be a Readable')

      if (typeof dest === 'string') this.dest = fs.createWriteStream(dest, { flags: 'a' })
      else if ((dest instanceof Writable) || (dest instanceof Duplex) || (dest instanceof Transform)) this.dest = dest
      else if ((typeof dest === 'object') && ('evt' in dest) && ('err' in dest)) {
        this.splitOut = true
        this.dest = dest
      }
      else throw new WoolError('Given output stream must be a Writable')
    }

    this.stream = undefined
  }
  static build(options) {
    return new Wool(options)
  }

  /*
   * Public methods
   */


  async start(onCount) {
    let evc = CountStream()
      , buildErrorHandler = str => e => { this.logger.error(str, e) }

    await new Promise((resolve) => {
      this.src
        .on('error', buildErrorHandler('While reading:'))
        .pipe(StreamSplit().on('error', buildErrorHandler('While spliting:')))
        .pipe(StreamParse(Event.parse).on('error', buildErrorHandler('While parsing:')))
        .pipe(AsyncMapStream(async e => this.rule.replay(e)).on('error', buildErrorHandler('While replaying events:')))
        .pipe(evc.on('error', buildErrorHandler('While counting:')))
        .on('data', () => { /* this empty function maintain the stream flowing */ })
        .on('finish', () => { resolve() })
    })

    if (typeof onCount === 'function') onCount(evc.count())

    if (!this.splitOut) {
      await new Promise((resolve) => {
        this.stream = StreamStringify(Event.stringify)
        this.stream
          .on('error', buildErrorHandler('While stringifying:'))
          .pipe(StreamJoin().on('error', buildErrorHandler('While joining:')))
          .pipe(
            this.dest
              .on('error', buildErrorHandler('On Destination'))
              .on('pipe', () => { resolve() })
          )
      })
    } else {
      const events_stream = await new Promise((resolve) => {
        const res = StreamStringify(Event.stringify)
        this.dest.evt = fs.createWriteStream(this.dest.evt, { flags: 'a' })
          .on('error', buildErrorHandler('On Destination'))
          .on('pipe', () => { resolve(res) })
        res.on('error', buildErrorHandler('While stringifying Events:'))
          .pipe(StreamJoin().on('error', buildErrorHandler('While joining:')))
          .pipe(this.dest.evt)
      })
      const error_stream = await new Promise((resolve) => {
        const res = StreamStringify(Event.stringify)
        this.dest.err = fs.createWriteStream(this.dest.err, { flags: 'a' })
          .on('error', buildErrorHandler('On Destination'))
          .on('pipe', () => { resolve(res) })
        res.on('error', buildErrorHandler('While stringifying Errors:'))
          .pipe(StreamJoin().on('error', buildErrorHandler('While joining:')))
          .pipe(this.dest.err)
      })

      this.stream = DispatchStream([
        [(e) => e.isSuccess(), events_stream],
        [() => true, error_stream],
      ])
      this.stream
        .on('error', buildErrorHandler('While stringifying:'))
    }
    return this
  }

  async push(cmd) {
    let evt = await this.rule.execute(cmd)
    this.stream.write(evt)
    return evt
  }

  end(onFinish) {
    this.stream.on('finish', onFinish)
    this.stream.end()
  }

  /**
   * getters
   */

  getRules() {
    return this.rule.rules
  }

}

module.exports = Wool.build
