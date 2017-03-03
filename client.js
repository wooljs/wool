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

var W3CWebSocket = require('websocket').w3cwebsocket
 
var client = new W3CWebSocket('ws://localhost:3000/', 'echo-protocol');
 
client.onerror = function() {
  console.log('Connection Error')
};
 
client.onopen = function() {
  console.log('WebSocket Client Connected')
 
  function sendNumber() {
    if (client.readyState === client.OPEN) {
      var number = Math.round(Math.random() * 0xFFFFFF)
      client.send(number.toString())
      setTimeout(sendNumber, 1000)
    }
  }
  sendNumber()
};
 
client.onclose = function() {
  console.log('echo-protocol Client Closed')
};
 
client.onmessage = function(e) {
  if (typeof e.data === 'string') {
    console.log("Received: '" + e.data + "'")
  }
};