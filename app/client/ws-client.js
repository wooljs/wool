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

module.exports = function(onmessage) {
  'use strict'

  var url = location.href.replace(/^http/, 'ws')
    , W3CWebSocket = require('websocket').w3cwebsocket
    , client = new W3CWebSocket(url, 'echo-protocol')

  client.onerror = function() {
    console.log('Connection Error', arguments)
  }

  client.onopen = function() {
    console.log('WebSocket Client Connected')
    client.send(JSON.stringify({t:'init'}))
  }

  client.onclose = function() {
    console.log('echo-protocol Client Closed')
    setTimeout(function() {
      var xhr = require('xhr')
      try {
        xhr.get('/ping', function (e, r/*, body*/) {
          console.log(r)
          console.error(e)
          if (r.statusCode === 200) {
            window.location.reload()
          }
        })
      } catch(e) {
        console.error(e)
      }
    }, 1000)
  }

  client.onmessage = function(e) {
    if (typeof e.data === 'string') {
      onmessage(e.data)
    }
  }

  return client
}
