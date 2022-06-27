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

'use strict'

const test = require('tape-async')
  , stream = require('stream')
  , util = require('util')
  , fs = require('fs')
  , { Command } = require('wool-model')
  , { Store } = require('wool-store')
  , TestStream = require(__dirname + '/test_stream.js')(util, stream)
  , rules = require(__dirname + '/rules.js')
  , Wool = require(__dirname + '/../index.js')
  , TEST_DB = __dirname + '/test_load.db'
  , TMP_DB = __dirname + '/tmp.db'

test('integrate', async function (t) {
  var count = 0
    , expected = [
      'S: 2017-05-02T09:48:12.450Z-0000 chatroom:send {"userId":"bar","chatId":"15bc9f0381e","msg":"^^"}',
      '\n',
      'S: 2017-05-02T09:48:42.666Z-0000 chatroom:send {"userId":"foo","chatId":"15bc9f0381e","msg":"I have to quit, bye"}',
      '\n',
      'S: 2017-05-02T09:49:02.010Z-0000 chatroom:send {"userId":"bar","chatId":"15bc9f0381e","msg":"ok, bye"}',
      '\n',
      'S: 2017-05-02T09:49:05.234Z-0000 chatroom:leave {"userId":"foo","chatId":"15bc9f0381e"}',
      '\n',
      'S: 2017-05-02T09:49:05.234Z-0001 chatroom:leave {"userId":"bar","chatId":"15bc9f0381e"}',
      '\n',
    ]
    , dest = TestStream(function (data, encoding, callback) {
      t.deepEqual(data.toString(), expected[count])
      count += 1
      this.push(data)
      callback()
    })
    , store = Store.build()

  await store.set('foo', { membership: [] })
  await store.set('bar', { membership: [] })

  let wool = await Wool({
    store,
    rules,
    events: {
      src: fs.createReadStream(TEST_DB, { flags: 'r' }),
      dest
    }
  }).start()

  let foo = await store.get('foo')
    , bar = await store.get('bar')
  t.deepEqual(foo, { membership: ['15bc9f0381e'] })
  t.deepEqual(bar, { membership: ['15bc9f0381e'] })

  let chat = await store.get('15bc9f0381e')
  t.deepEqual(chat.members, ['foo', 'bar'])
  t.deepEqual(chat.messages.length, 9)

  await wool.push(new Command(new Date('2017-05-02T09:48:12.450Z'), 0, 'chatroom:send', { 'userId': 'bar', 'chatId': '15bc9f0381e', 'msg': '^^' }))
  t.deepEqual(chat.members, ['foo', 'bar'])
  t.deepEqual(chat.messages.length, 10)

  await wool.push(new Command(new Date('2017-05-02T09:48:42.666Z'), 0, 'chatroom:send', { 'userId': 'foo', 'chatId': '15bc9f0381e', 'msg': 'I have to quit, bye' }))
  t.deepEqual(chat.members, ['foo', 'bar'])
  t.deepEqual(chat.messages.length, 11)

  await wool.push(new Command(new Date('2017-05-02T09:49:02.010Z'), 0, 'chatroom:send', { 'userId': 'bar', 'chatId': '15bc9f0381e', 'msg': 'ok, bye' }))
  t.deepEqual(chat.members, ['foo', 'bar'])
  t.deepEqual(chat.messages.length, 12)

  t.deepEqual(foo, { membership: ['15bc9f0381e'] })
  t.deepEqual(bar, { membership: ['15bc9f0381e'] })

  await wool.push(new Command(new Date('2017-05-02T09:49:05.234Z'), 0, 'chatroom:leave', { 'userId': 'foo', 'chatId': '15bc9f0381e' }))
  t.deepEqual(chat.members, ['bar'])
  t.deepEqual(chat.messages.length, 13)

  t.deepEqual(foo, { membership: [] })
  t.deepEqual(bar, { membership: ['15bc9f0381e'] })

  await wool.push(new Command(new Date('2017-05-02T09:49:05.234Z'), 1, 'chatroom:leave', { 'userId': 'bar', 'chatId': '15bc9f0381e' }))
  t.deepEqual(chat.members, [])
  t.deepEqual(chat.messages.length, 14)

  t.deepEqual(foo, { membership: [] })
  t.deepEqual(bar, { membership: [] })

  await new Promise((resolve) => {
    wool.end(resolve)
  })

  t.plan(30)
  t.end()
})

test('with db in file', async function (t) {
  if (fs.existsSync(TMP_DB)) {
    fs.unlinkSync(TMP_DB)
  }
  fs.copyFileSync(TEST_DB, TMP_DB)

  let store = Store.build()
  await store.set('foo', { membership: [] })
  await store.set('bar', { membership: [] })

  let counter = 0

  let wool = await Wool({
    store,
    rules,
    events: TMP_DB
  }).start((c) => counter = c)

  t.deepEqual(counter, 9)

  let foo = await store.get('foo')
    , bar = await store.get('bar')
  t.deepEqual(foo, { membership: ['15bc9f0381e'] })
  t.deepEqual(bar, { membership: ['15bc9f0381e'] })

  let chat = await store.get('15bc9f0381e')
  t.deepEqual(chat.members, ['foo', 'bar'])
  t.deepEqual(chat.messages.length, 9)

  await wool.push(new Command(new Date('2017-05-02T09:49:05.234Z'), 0, 'chatroom:leave', { 'userId': 'foo', 'chatId': '15bc9f0381e' }))
  t.deepEqual(chat.members, ['bar'])
  t.deepEqual(chat.messages.length, 10)

  t.deepEqual(foo, { membership: [] })
  t.deepEqual(bar, { membership: ['15bc9f0381e'] })

  await wool.push(new Command(new Date('2017-05-02T09:49:05.234Z'), 1, 'chatroom:leave', { 'userId': 'bar', 'chatId': '15bc9f0381e' }))
  t.deepEqual(chat.members, [])
  t.deepEqual(chat.messages.length, 11)

  t.deepEqual(foo, { membership: [] })
  t.deepEqual(bar, { membership: [] })

  t.deepEqual(counter, 9)

  t.plan(14)
  t.end()
})


test('with db in file split output', async function (t) {
  const ERR_DB = __dirname + '/tmp_err.db'
  if (fs.existsSync(TMP_DB)) {
    fs.unlinkSync(TMP_DB)
  }
  if (fs.existsSync(ERR_DB)) {
    fs.unlinkSync(ERR_DB)
  }
  fs.copyFileSync(TEST_DB, TMP_DB)

  let store = Store.build()
  await store.set('foo', { membership: [] })
  await store.set('bar', { membership: [] })

  let counter = 0

  let wool = await Wool({
    store,
    rules,
    events: {
      src: TMP_DB,
      dest: {
        evt: TMP_DB,
        err: ERR_DB
      }
    }
  }).start((c) => counter = c)

  t.deepEqual(counter, 9)

  let foo = await store.get('foo')
    , bar = await store.get('bar')
  t.deepEqual(foo, { membership: ['15bc9f0381e'] })
  t.deepEqual(bar, { membership: ['15bc9f0381e'] })

  let chat = await store.get('15bc9f0381e')
  t.deepEqual(chat.members, ['foo', 'bar'])
  t.deepEqual(chat.messages.length, 9)

  await wool.push(new Command(new Date('2017-05-02T09:49:05.234Z'), 0, 'chatroom:leave', { 'userId': 'foo', 'chatId': '15bc9f0381e' }))
  t.deepEqual(chat.members, ['bar'])
  t.deepEqual(chat.messages.length, 10)

  t.deepEqual(foo, { membership: [] })
  t.deepEqual(bar, { membership: ['15bc9f0381e'] })

  const evt = await wool.push(new Command(new Date('2017-05-02T09:49:05.234Z'), 1, 'chatroom:leave', { 'userId': 'NONE', 'chatId': 'WRONG' }))
  t.deepEqual(evt.status, 'I')

  await wool.push(new Command(new Date('2017-05-02T09:49:05.234Z'), 1, 'chatroom:leave', { 'userId': 'bar', 'chatId': '15bc9f0381e' }))
  t.deepEqual(chat.members, [])
  t.deepEqual(chat.messages.length, 11)

  t.deepEqual(foo, { membership: [] })
  t.deepEqual(bar, { membership: [] })

  t.deepEqual(counter, 9)


  // wait everythins is finished
  await new Promise((resolve) => wool.end(() => {
    Promise.all([
      new Promise((r) => wool.dest.evt.on('finish', r)),
      new Promise((r) => wool.dest.err.on('finish', r)),
    ]).then(resolve)
  }))

  const evt_data = fs.readFileSync(TMP_DB).toString('utf8').split('\n')
  t.deepEqual(evt_data.length, 12)

  const err_data = fs.readFileSync(ERR_DB).toString('utf8').split('\n')
  t.deepEqual(err_data.length, 2)

  t.plan(17)
  t.end()
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
      rules: rules,
      events: ''
    })
    t.fail('should throw !')
  } catch (e) {
    t.deepEqual(e.toString(), 'Error: Cannot create empty file for db')
  }

  try {
    await Wool({
      store: Store.build(),
      rules: rules,
      events: {}
    })
    t.fail('should throw !')
  } catch (e) {
    t.deepEqual(e.toString(), 'Error: Given input stream must be a Readable')
  }

  try {
    await Wool({
      store: Store.build(),
      rules: rules,
      events: {
        src: fs.createReadStream(TEST_DB, { flags: 'r' })
      }
    })
    t.fail('should throw !')
  } catch (e) {
    t.deepEqual(e.toString(), 'Error: Given output stream must be a Writable')
  }

  t.plan(5)
  t.end()
})
