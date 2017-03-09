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
  , TestStream = require( __dirname + '/test_stream.js')(util,stream)
  , wool = require( __dirname + '/../lib/wool.js')

test('integrate: contains spec with an expectation', function(t) {
  var count = 0
    , i = 0
    , expected = [
      '{"yo":"yeah"}',
      '\n',
      '{"plip":{"paf":"pouf"}}',
      '\n',
      '42',
      '\n',
      '"paf"',
      '\n'
    ]
    , out = TestStream(function (data, encoding, callback) {
      t.deepEqual(data.toString(),expected[count])
      count += 1
      this.push(data)
      callback()
    })
    .on('finish', function () {
      t.deepEqual(count, 8)
      t.deepEqual(i, 6)
      t.end()
    })

  wool()
  .dispatch({ $: function(e) { return typeof e === 'object' }, _: function() { i += 1 } })
  .fromFile(__dirname + '/test_load.db')
  .toStream(out)
  .onReady(function() {
    this.push({yo:'yeah'})
    this.push({plip:{paf:'pouf'}})
    this.push(42)
    this.push('paf')
    this.end()
  })
  .run()

})