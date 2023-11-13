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
  , { AsyncMapStream, CountStream, StreamSplit, StreamJoin, StreamParse, StreamStringify, DispatchStream, PushStream } = require('wool-stream')
  , { Event, Command } = require('wool-model')
  , { RuleEngine } = require('wool-rule')
  , { Store } = require('wool-store')

const filenameOrReadable = (s) => {
  if (s instanceof Readable) return s
  else if (typeof s === 'string') return fs.createReadStream(s, { flags: 'r' })
  else throw new WoolError(`${s} should be a valid filename or a Readable stream`)
}
const filenameOrWritable = (s) => {
  if (s instanceof Readable) return s
  else if (typeof s === 'string') return fs.createWriteStream(s, { flags: 'a' })
  else throw new WoolError(`${s} should be a valid filename or a Readable stream`)
}

class WoolError extends Error { }

class Wool {
  constructor(options) {
    const { logger, store, rules, events } = options

    if (!(store instanceof Store)) throw new WoolError(store + ' is not an instance of Store.')
    this.store = store

    if (rules.length === 0) throw new WoolError('Cannot accept empty rules list')
    this.rule = new RuleEngine(this.store)
    this.rule.addRules(rules)

    this.logger = logger || console

    this.splitIn = false
    this.splitOut = false

    if (typeof events === 'string') {
      if (events.length === 0) throw new WoolError('Cannot create empty file for db')
      this.src = fs.createReadStream(events, { flags: 'r' })
      this.dest = fs.createWriteStream(events, { flags: 'a' })
    } else if (typeof events === 'object') {
      if (!(('src' in events) && ('dest' in events))) throw new WoolError('Configuration item "events" should contain both "src" and "dest" input')
      const { src, dest } = events

      if (typeof src === 'string') this.src = fs.createReadStream(src, { flags: 'r' })
      else if (src instanceof Readable) this.src = src
      else if (typeof src === 'object') {
        if (('evt' in src) && ('init' in src)) {
          this.splitIn = true
          this.src = {
            evt: filenameOrReadable(src.evt),
            init: filenameOrReadable(src.init),
          }
          if ('upgrade' in src) {
            this.src.upgrade = filenameOrReadable(src.upgrade)
          }
        } else throw new WoolError('Configuration item "events.src" should contain "evt" and "init" (optionally "upgrade")')
      }
      else throw new WoolError('Given input stream must be a Readable')

      if (typeof dest === 'string') this.dest = fs.createWriteStream(dest, { flags: 'a' })
      else if ((dest instanceof Writable) || (dest instanceof Duplex) || (dest instanceof Transform)) this.dest = dest
      else if (typeof dest === 'object') {
        if (('evt' in dest) && ('err' in dest)) {
          this.splitOut = true
          this.dest = {
            evt: filenameOrWritable(dest.evt),
            err: filenameOrWritable(dest.err),
          }
        } else throw new WoolError('Configuration item "events.dest" should contain "evt" and "err"')
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
    const evc = CountStream()
      , buildErrorHandler = str => e => { this.logger.error(str, e) }

    let last_time = null

    if (!this.splitIn) {
      await this.readSource(this.src, buildErrorHandler, evc)
      this.src = null
    } else {
      const { init, evt } = this.src
      last_time = await this.readSource(init, buildErrorHandler, evc)
      last_time = await this.readSource(evt, buildErrorHandler, evc)
    }

    if (!this.splitOut) {
      this.stream = await this.prepareDest(this.dest, buildErrorHandler)
    } else {
      const events_stream = await this.prepareDest(this.dest.evt, buildErrorHandler)
      const error_stream = await this.prepareDest(this.dest.err, buildErrorHandler)

      this.stream = DispatchStream([
        [(e) => e.isSuccess(), events_stream],
        [() => true, error_stream],
      ])
      this.stream
        .on('error', buildErrorHandler('While stringifying:'))
    }

    if (this.splitIn && ('upgrade' in this.src)) {
      const { upgrade } = this.src
      await new Promise((resolve) => {
        upgrade
          .on('error', buildErrorHandler('While reading:'))
          .pipe(StreamSplit().on('error', buildErrorHandler('While splitting:')))
          .pipe(StreamParse((s) => {
            //convert events to commands
            const e = Event.parse(s)
            return new Command(e.t, e.o, e.name, e.data)
          }).on('error', buildErrorHandler('While parsing:')))
          .pipe(AsyncMapStream(async (e) => {
            // here we push the upgrade event into the dest stream if it comes after last event
            if (e.t > last_time) await this.push(e)
          }).on('error', buildErrorHandler('While replaying events:')))
          .pipe(PushStream(evc).on('error', buildErrorHandler('While counting:')))
          .on('data', () => { })
          .on('finish', () => { resolve() })
      })
      this.src = null
    }

    if (typeof onCount === 'function') onCount(evc.count())

    return this
  }

  async readSource(src, buildErrorHandler, evc) {
    let last_time
    await new Promise((resolve) => {
      src
        .on('error', buildErrorHandler('While reading:'))
        .pipe(StreamSplit().on('error', buildErrorHandler('While splitting:')))
        .pipe(StreamParse(Event.parse).on('error', buildErrorHandler('While parsing:')))
        .pipe(AsyncMapStream(async (e) => {
          last_time = e.t
          await this.rule.replay(e)
        }).on('error', buildErrorHandler('While replaying events:')))
        .pipe(PushStream(evc).on('error', buildErrorHandler('While counting:')))
        .on('data', () => { })
        .on('finish', () => { resolve() })
    })
    return last_time
  }

  async prepareDest(dest, buildErrorHandler) {
    return await new Promise((resolve) => {
      const res = StreamStringify(Event.stringify)
      dest
        .on('error', buildErrorHandler('On Destination'))
        .on('pipe', () => { resolve(res) })
      res.on('error', buildErrorHandler('While stringifying:'))
        .pipe(StreamJoin().on('error', buildErrorHandler('While joining:')))
        .pipe(dest)
    })
  }

  async push(cmd) {
    const evt = await this.rule.execute(cmd)
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
