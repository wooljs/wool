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

var test = require('tape')
  , stream = require('stream')
  , util = require('util')
  , Event = require('wool-stream').Event
  , TestStream = require( __dirname + '/test_stream.js')(util,stream)
  , rules = require( __dirname + '/rules.js')
  , wool = require( __dirname + '/../lib/wool.js')

test('integrate: contains spec with an expectation', function(t) {
  var count = 0
    , expected = [
      '2017-05-02T09:48:12.450Z-0000 send_message {"userId":"bar","chatId":"15bc9f0381e","msg":"^^"}',
      '\n',
      '2017-05-02T09:48:42.666Z-0000 send_message {"userId":"foo","chatId":"15bc9f0381e","msg":"I have to quit, bye"}',
      '\n',
      '2017-05-02T09:49:02.010Z-0000 send_message {"userId":"bar","chatId":"15bc9f0381e","msg":"ok, bye"}',
      '\n',
      '2017-05-02T09:49:05.234Z-0000 leave_chatroom {"userId":"foo","chatId":"15bc9f0381e"}',
      '\n',
      '2017-05-02T09:49:05.234Z-0001 leave_chatroom {"userId":"bar","chatId":"15bc9f0381e"}',
      '\n',
    ]
    , out = TestStream(function (data, encoding, callback) {
      t.deepEqual(data.toString(),expected[count])
      count += 1
      this.push(data)
      callback()
    })
    .on('finish', function () {
      t.plan(10)
      t.end()
    })

  wool()
  .rule(rules)
  .fromFile(__dirname + '/test_load.db')
  .toStream(out)
  .onReady(function() {
    this.push(Event(new Date('2017-05-02T09:48:12.450Z'), 0, 'send_message', {'userId': 'bar', 'chatId': '15bc9f0381e', 'msg': '^^'}))
    this.push(Event(new Date('2017-05-02T09:48:42.666Z'), 0, 'send_message', {'userId': 'foo', 'chatId': '15bc9f0381e', 'msg': 'I have to quit, bye'}))
    this.push(Event(new Date('2017-05-02T09:49:02.010Z'), 0, 'send_message', {'userId': 'bar', 'chatId': '15bc9f0381e', 'msg': 'ok, bye'}))
    this.push(Event(new Date('2017-05-02T09:49:05.234Z'), 0, 'leave_chatroom', {'userId': 'foo', 'chatId': '15bc9f0381e'}))
    this.push(Event(new Date('2017-05-02T09:49:05.234Z'), 1, 'leave_chatroom', {'userId': 'bar', 'chatId': '15bc9f0381e'}))
    this.end()
  })
  .run()

})