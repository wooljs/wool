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

import test from 'tape'
import stream from 'stream'
import fs from 'fs'

import { Command } from 'wool-model'
import { Store } from 'wool-store'
import { TestStream } from 'wool-stream'

import rulesChatroom from './rules-chatroom.js'
import rulesVersion from './rules-version.js'
import Wool from '../index.js'

const TEST_DB = 'test/test_load_chatroom.db'
const TMP_DB = 'test/tmp.db'
const ERR_DB = 'test/tmp_err.db'

test('integrate', async function (t) {
  try {
    let count = 0
    const expected = [
      'S: 2017-05-02T09:48:12.450Z-0000 chatroom:send {"userId":"bar","chatId":"15bc9f0381e","msg":"^^"}',
      '\n',
      'S: 2017-05-02T09:48:42.666Z-0000 chatroom:send {"userId":"foo","chatId":"15bc9f0381e","msg":"I have to quit, bye"}',
      '\n',
      'S: 2017-05-02T09:49:02.010Z-0000 chatroom:send {"userId":"bar","chatId":"15bc9f0381e","msg":"ok, bye"}',
      '\n',
      'S: 2017-05-02T09:49:05.234Z-0000 chatroom:leave {"userId":"foo","chatId":"15bc9f0381e"}',
      '\n',
      'S: 2017-05-02T09:49:05.234Z-0001 chatroom:leave {"userId":"bar","chatId":"15bc9f0381e"}',
      '\n'
    ]
    const dest = new TestStream(function (data, encoding, callback) {
      t.deepEqual(data.toString(), expected[count])
      count += 1
      this.push(data)
      callback()
    })
    const store = Store.build()

    await store.set('foo', { membership: [] })
    await store.set('bar', { membership: [] })

    const wool = await Wool({
      store,
      rules: rulesChatroom,
      events: {
        src: fs.createReadStream(TEST_DB, { flags: 'r' }),
        dest
      }
    }).start()

    const foo = await store.get('foo')
    const bar = await store.get('bar')
    t.deepEqual(foo, { membership: ['15bc9f0381e'] })
    t.deepEqual(bar, { membership: ['15bc9f0381e'] })

    const chat = await store.get('15bc9f0381e')
    t.deepEqual(chat.members, ['foo', 'bar'])
    t.deepEqual(chat.messages.length, 9)

    await wool.push(new Command(new Date('2017-05-02T09:48:12.450Z'), 0, 'chatroom:send', { userId: 'bar', chatId: '15bc9f0381e', msg: '^^' }))
    t.deepEqual(chat.members, ['foo', 'bar'])
    t.deepEqual(chat.messages.length, 10)

    await wool.push(new Command(new Date('2017-05-02T09:48:42.666Z'), 0, 'chatroom:send', { userId: 'foo', chatId: '15bc9f0381e', msg: 'I have to quit, bye' }))
    t.deepEqual(chat.members, ['foo', 'bar'])
    t.deepEqual(chat.messages.length, 11)

    await wool.push(new Command(new Date('2017-05-02T09:49:02.010Z'), 0, 'chatroom:send', { userId: 'bar', chatId: '15bc9f0381e', msg: 'ok, bye' }))
    t.deepEqual(chat.members, ['foo', 'bar'])
    t.deepEqual(chat.messages.length, 12)

    t.deepEqual(foo, { membership: ['15bc9f0381e'] })
    t.deepEqual(bar, { membership: ['15bc9f0381e'] })

    await wool.push(new Command(new Date('2017-05-02T09:49:05.234Z'), 0, 'chatroom:leave', { userId: 'foo', chatId: '15bc9f0381e' }))
    t.deepEqual(chat.members, ['bar'])
    t.deepEqual(chat.messages.length, 13)

    t.deepEqual(foo, { membership: [] })
    t.deepEqual(bar, { membership: ['15bc9f0381e'] })

    await wool.push(new Command(new Date('2017-05-02T09:49:05.234Z'), 1, 'chatroom:leave', { userId: 'bar', chatId: '15bc9f0381e' }))
    t.deepEqual(chat.members, [])
    t.deepEqual(chat.messages.length, 14)

    t.deepEqual(foo, { membership: [] })
    t.deepEqual(bar, { membership: [] })

    await new Promise((resolve) => {
      wool.end(resolve)
    })
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(30)
    t.end()
  }
})

test('with db in file', async function (t) {
  try {
    if (fs.existsSync(TMP_DB)) {
      fs.unlinkSync(TMP_DB)
    }
    fs.copyFileSync(TEST_DB, TMP_DB)

    const store = Store.build()
    await store.set('foo', { membership: [] })
    await store.set('bar', { membership: [] })

    let counter = 0

    const wool = await Wool({
      store,
      rules: rulesChatroom,
      events: TMP_DB
    }).start((c) => { counter = c })

    t.deepEqual(counter, 9)

    const foo = await store.get('foo')
    const bar = await store.get('bar')
    t.deepEqual(foo, { membership: ['15bc9f0381e'] })
    t.deepEqual(bar, { membership: ['15bc9f0381e'] })

    const chat = await store.get('15bc9f0381e')
    t.deepEqual(chat.members, ['foo', 'bar'])
    t.deepEqual(chat.messages.length, 9)

    await wool.push(new Command(new Date('2017-05-02T09:49:05.234Z'), 0, 'chatroom:leave', { userId: 'foo', chatId: '15bc9f0381e' }))
    t.deepEqual(chat.members, ['bar'])
    t.deepEqual(chat.messages.length, 10)

    t.deepEqual(foo, { membership: [] })
    t.deepEqual(bar, { membership: ['15bc9f0381e'] })

    await wool.push(new Command(new Date('2017-05-02T09:49:05.234Z'), 1, 'chatroom:leave', { userId: 'bar', chatId: '15bc9f0381e' }))
    t.deepEqual(chat.members, [])
    t.deepEqual(chat.messages.length, 11)

    t.deepEqual(foo, { membership: [] })
    t.deepEqual(bar, { membership: [] })

    t.deepEqual(counter, 9)
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(14)
    t.end()
  }
})

test('with db in file split output', async function (t) {
  try {
    if (fs.existsSync(TMP_DB)) {
      fs.unlinkSync(TMP_DB)
    }
    if (fs.existsSync(ERR_DB)) {
      fs.unlinkSync(ERR_DB)
    }
    fs.copyFileSync(TEST_DB, TMP_DB)

    const store = Store.build()
    await store.set('foo', { membership: [] })
    await store.set('bar', { membership: [] })

    let counter = 0

    const wool = await Wool({
      store,
      rules: rulesChatroom,
      events: {
        src: TMP_DB,
        dest: {
          evt: TMP_DB,
          err: ERR_DB
        }
      }
    }).start((c) => { counter = c })

    t.deepEqual(counter, 9)

    const foo = await store.get('foo')
    const bar = await store.get('bar')
    t.deepEqual(foo, { membership: ['15bc9f0381e'] })
    t.deepEqual(bar, { membership: ['15bc9f0381e'] })

    const chat = await store.get('15bc9f0381e')
    t.deepEqual(chat.members, ['foo', 'bar'])
    t.deepEqual(chat.messages.length, 9)

    await wool.push(new Command(new Date('2017-05-02T09:49:05.234Z'), 0, 'chatroom:leave', { userId: 'foo', chatId: '15bc9f0381e' }))
    t.deepEqual(chat.members, ['bar'])
    t.deepEqual(chat.messages.length, 10)

    t.deepEqual(foo, { membership: [] })
    t.deepEqual(bar, { membership: ['15bc9f0381e'] })

    const evt = await wool.push(new Command(new Date('2017-05-02T09:49:05.234Z'), 1, 'chatroom:leave', { userId: 'NONE', chatId: 'WRONG' }))
    t.deepEqual(evt.status, 'I')

    await wool.push(new Command(new Date('2017-05-02T09:49:05.234Z'), 1, 'chatroom:leave', { userId: 'bar', chatId: '15bc9f0381e' }))
    t.deepEqual(chat.members, [])
    t.deepEqual(chat.messages.length, 11)

    t.deepEqual(foo, { membership: [] })
    t.deepEqual(bar, { membership: [] })

    t.deepEqual(counter, 9)

    // wait everythins is finished
    await new Promise((resolve) => wool.end(() => {
      Promise.all([
        new Promise((resolve) => wool.dest.evt.on('finish', resolve)),
        new Promise((resolve) => wool.dest.err.on('finish', resolve))
      ]).then(resolve)
    }))

    const evtData = fs.readFileSync(TMP_DB).toString('utf8').split('\n')
    t.deepEqual(evtData.length, 12)

    const errData = fs.readFileSync(ERR_DB).toString('utf8').split('\n')
    t.deepEqual(errData.length, 2)
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(17)
    t.end()
  }
})

test('with db in file split input', async function (t) {
  try {
    let count = 0
    const init = [
      'S: 2023-11-10T12:15:00.000Z-0000 version:init {"version":[0, 0, 0]}',
      '\n'
    ]
    const events = [
      'S: 2023-11-10T12:16:00.000Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:16:30.000Z-0000 version:minor {}',
      '\n',
      'S: 2023-11-10T12:17:00.000Z-0000 version:set {"version":[2, 0, 0]}',
      '\n',
      'S: 2023-11-10T12:17:10.000Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.001Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.002Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.003Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.004Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.005Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.006Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.007Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.008Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.009Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.010Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.011Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.012Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.013Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.014Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.015Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.016Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.017Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.018Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.019Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.020Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.021Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.022Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.023Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.024Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.025Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.026Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.027Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.028Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:17:10.029Z-0000 version:patch {}',
      '\n'
    ]
    const expected = [
      'S: 2023-11-10T12:18:12.943Z-0000 version:minor {}',
      '\n',
      'S: 2023-11-10T12:19:05.234Z-0000 version:major {}',
      '\n'
    ]
    const dest = new TestStream(function (data, encoding, callback) {
      t.deepEqual(data.toString(), expected[count])
      count += 1
      this.push(data)
      callback()
    })
    const store = Store.build()

    let counter = 0

    const wool = await (Wool({
      store,
      rules: rulesVersion,
      // logger: console,
      events: {
        src: {
          evt: stream.Readable.from(events),
          init: stream.Readable.from(init)
        },
        dest
      }
    }).start((c) => { counter = c }))

    t.deepEqual(counter, 34)

    t.deepEqual(await store.get('Version'), {
      id: 'Version',
      t: new Date('2023-11-10T12:17:10.029Z'),
      version: [2, 0, 30]
    })

    await wool.push(new Command(new Date('2023-11-10T12:18:12.943Z'), 0, 'version:minor', {}))

    t.deepEqual(await store.get('Version'), {
      id: 'Version',
      t: new Date('2023-11-10T12:18:12.943Z'),
      version: [2, 1, 0]
    })

    await wool.push(new Command(new Date('2023-11-10T12:19:05.234Z'), 0, 'version:major', {}))

    t.deepEqual(await store.get('Version'), {
      id: 'Version',
      t: new Date('2023-11-10T12:19:05.234Z'),
      version: [3, 0, 0]
    })
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(8)
    t.end()
  }
})

test('with db in file split input with upgrade', async function (t) {
  try {
    let count = 0
    const init = [
      'S: 2023-11-10T12:15:00.000Z-0000 version:init {"version":[0, 0, 0]}',
      '\n'
    ]
    const events = [
      'S: 2023-11-10T12:16:00.000Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:16:30.000Z-0000 version:minor {}',
      '\n',
      'S: 2023-11-10T12:17:00.000Z-0000 version:set {"version":[2, 0, 0]}',
      '\n',
      'S: 2023-11-10T12:17:10.000Z-0000 version:patch {}',
      '\n'
    ]
    const upgrade = [
      // this update is not played because its date is before last event from events
      'S: 2023-11-10T12:17:00.000Z-0000 version:set {"version":[2, 0, 0]}',
      '\n',
      'S: 2023-11-10T12:17:30.000Z-0000 version:patch {}',
      '\n'
    ]
    const expected = [
      'S: 2023-11-10T12:17:30.000Z-0000 version:patch {}',
      '\n',
      'S: 2023-11-10T12:18:12.943Z-0000 version:minor {}',
      '\n',
      'S: 2023-11-10T12:19:05.234Z-0000 version:major {}',
      '\n'
    ]
    const dest = new TestStream(function (data, encoding, callback) {
      t.deepEqual(data.toString(), expected[count])
      count += 1
      this.push(data)
      callback()
    })
    const store = Store.build()

    let counter = 0

    const wool = await (Wool({
      store,
      rules: rulesVersion,
      events: {
        src: {
          evt: stream.Readable.from(events),
          init: stream.Readable.from(init),
          upgrade: stream.Readable.from(upgrade)
        },
        dest
      }
    }).start((c) => { counter = c }))

    t.deepEqual(counter, 7)

    t.deepEqual(await store.get('Version'), {
      id: 'Version',
      t: new Date('2023-11-10T12:17:30.000Z'),
      version: [2, 0, 2]
    })

    await wool.push(new Command(new Date('2023-11-10T12:18:12.943Z'), 0, 'version:minor', {}))

    t.deepEqual(await store.get('Version'), {
      id: 'Version',
      t: new Date('2023-11-10T12:18:12.943Z'),
      version: [2, 1, 0]
    })

    await wool.push(new Command(new Date('2023-11-10T12:19:05.234Z'), 0, 'version:major', {}))

    t.deepEqual(await store.get('Version'), {
      id: 'Version',
      t: new Date('2023-11-10T12:19:05.234Z'),
      version: [3, 0, 0]
    })
  } catch (e) {
    t.fail(e.stack)
  } finally {
    t.plan(10)
    t.end()
  }
})

test('error options', async function (t) {
  try {
    await Wool({
      store: {},
      rules: {},
      events: ''
    })
    t.fail('should throw !')
  } catch (e) {
    t.deepEqual(e.toString(), 'Error: [object Object] is not an instance of Store.')
  }

  try {
    await Wool({
      store: Store.build(),
      rules: [],
      events: ''
    })
    t.fail('should throw !')
  } catch (e) {
    t.deepEqual(e.toString(), 'Error: Cannot accept empty rules list')
  }

  try {
    await Wool({
      store: Store.build(),
      rules: rulesChatroom,
      events: ''
    })
    t.fail('should throw !')
  } catch (e) {
    t.deepEqual(e.toString(), 'Error: Cannot create empty file for db')
  }

  try {
    await Wool({
      store: Store.build(),
      rules: rulesChatroom,
      events: {}
    })
    t.fail('should throw !')
  } catch (e) {
    t.deepEqual(e.toString(), 'Error: Configuration item "events" should contain both "src" and "dest" input')
  }

  try {
    await Wool({
      store: Store.build(),
      rules: rulesChatroom,
      events: {
        src: fs.createReadStream(TEST_DB, { flags: 'r' })
      }
    })
    t.fail('should throw !')
  } catch (e) {
    t.deepEqual(e.toString(), 'Error: Configuration item "events" should contain both "src" and "dest" input')
  }

  t.plan(5)
  t.end()
})
