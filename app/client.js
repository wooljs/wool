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

var yo = require('yo-yo')
  , state = {}
  , el = main(state, update)
  , client = require('./ws-client')(function(data) {
      console.log("Received: " + data)
      var d = JSON.parse(data)
      state[d.k] = d.v
      // construct a new list and efficiently diff+morph it into the one in the DOM
      var newList = main(state, update)
      yo.update(el, newList)
  })
  
function main(state, onclick) {
  return yo`<div>
    <input type="text" id="key">
    <input type="text" id="value">
    <button onclick=${onclick}>send</button>
    <table>
    <tbody>
      ${Object.keys(state).map(function (key) {
        return yo`<tr><td>${key}</td><td>${JSON.stringify(state[key], null, 3)}</td></tr>`
      })}
    </tbody>
    </table>
  </div>`
}

function update (e) {
  if (client.readyState === client.OPEN) {
    var key = document.getElementById('key').value
      , value = document.getElementById('value').value
      , payload = JSON.stringify({ k: key, v: value })
    console.log("Sent: " + payload)
    client.send(payload)
  }
}

document.body.appendChild(el)

