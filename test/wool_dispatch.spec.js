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
  , wd = require(__dirname + '/../lib/wool_dispatch.js')()

test('build an dispatch with one catchall function projection', function(t) {
  var count = 0
    , q = wd(function() { count++ })

  q({}); q({}); q({}); q({}); q({})

  t.deepEqual(count, 5)
  t.end()
})

test('build an dispatch with an object with projection only with symbol definition', function(t) {
  var count = 0
    , q = wd({
      _: function() { count++ }
    })

  q({}); q({}); q({}); q({}); q({}); q({})

  t.deepEqual(count, 6)
  t.end()
})

test('build an dispatch with an object with projection only with short definition', function(t) {
  var count = 0
    , q = wd({
      proj: function() { count++ }
    })

  q({}); q({}); q({}); q({})

  t.deepEqual(count, 4)
  t.end()
})

test('build an dispatch with an object with projection only with long definition', function(t) {
  var count = 0
    , q = wd({
      projector: function() { count++ }
    })

  q({}); q({}); q({}); q({}); q({}); q({}) ; q({})

  t.deepEqual(count, 7)
  t.end()
})


test('build an dispatch with an object with truthy validation and projection with symbol definition', function(t) {
  var count = 0
    , q = wd({
      $: function() { return true },
      _: function() { count++ }
    })

  q({}); q({}); q({}); q({}); q({}); q({}) ; q({})

  t.deepEqual(count, 7)
  t.end()
})

test('build an dispatch with an object with truthy validation and projection with short projector and symbol validator', function(t) {
  var count = 0
    , q = wd({
      $: function() { return true },
      proj: function() { count++ }
    })

  q({}); q({}); q({}); q({}); q({}); q({})

  t.deepEqual(count, 6)
  t.end()
})

test('build an dispatch with an object with truthy validation and projection with long projector and symbol validator', function(t) {
  var count = 0
    , q = wd({
      $: function() { return true },
      projector: function() { count++ }
    })

  q({}); q({}); q({}); q({}); q({}); q({})

  t.deepEqual(count, 6)
  t.end()
})

test('build an dispatch with an object with truthy validation and projection with symbol projector and short validator', function(t) {
  var count = 0
    , q = wd({
      val: function() { return true },
      _: function() { count++ }
    })

  q({}); q({}); q({}); q({}); q({})

  t.deepEqual(count, 5)
  t.end()
})

test('build an dispatch with an object with truthy validation and projection with short projector and short validator', function(t) {
  var count = 0
    , q = wd({
      val: function() { return true },
      proj: function() { count++ }
    })

  q({}); q({}); q({}); q({})

  t.deepEqual(count, 4)
  t.end()
})

test('build an dispatch with an object with truthy validation and projection with long projector and short validator', function(t) {
  var count = 0
    , q = wd({
      val: function() { return true },
      projector: function() { count++ }
    })

  q({}); q({}); q({}); q({})

  t.deepEqual(count, 4)
  t.end()
})

test('build an dispatch with an object with truthy validation and projection with symbol projector and long validator', function(t) {
  var count = 0
    , q = wd({
      validator: function() { return true },
      _: function() { count++ }
    })

  q({}); q({}); q({}); q({})

  t.deepEqual(count, 4)
  t.end()
})

test('build an dispatch with an object with truthy validation and projection with short projector and long validator', function(t) {
  var count = 0
    , q = wd({
      validator: function() { return true },
      proj: function() { count++ }
    })

  q({}); q({}); q({}); q({})

  t.deepEqual(count, 4)
  t.end()
})

test('build an dispatch with an object with truthy validation and projection with long projector and long validator', function(t) {
  var count = 0
    , q = wd({
      validator: function() { return true },
      projector: function() { count++ }
    })

  q({}); q({}); q({}); q({})

  t.deepEqual(count, 4)
  t.end()
})

test('build an dispatch with two dispatchers filtering event of t "a" and "b"', function(t) {
  var count_a = 0, count_b = 0
    , q = wd({
      $: function(e) { if (e.t=== 'a') return true },
      _: function() { count_a++ }
    },{
      $: function(e) { if (e.t=== 'b') return true },
      _: function() { count_b++ }
    })

  q({t:'a'}); q({}); q({t:'a'}); q({t:'b'}); q({t:'a'})

  t.deepEqual(count_a, 3)
  t.deepEqual(count_b, 1)
  t.end()
})
