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
  , state = {command:{list:[], cur:''}, data:{}}
  , el = main(state, update)
  , client = require('./ws-client')(function(data) {
    console.log("Received: " + data)
    var m = JSON.parse(data)
    if ('t' in m) {
      switch(m.t) {
        case 'init': {
          state.command.list = m.d.command.list
        }
        break;
      }
    }
    // construct a new list and efficiently diff+morph it into the one in the DOM
    var newList = main(state, update)
    yo.update(el, newList)
  })
  
function main(state, onclick) {
  return yo`<div>
    <div>
      <p>Command : <select id="command">${state.command.list.map(function (cmd) { return yo`<option value="${cmd.n}">${cmd.n}</option>` })} </select></p>
      <textarea id="data">${state.command.cur}</textarea>
      <button onclick=${onclick}>send</button>
    </div>
    <table>
    <tbody>
      ${Object.keys(state.data).map(function (key) {
        return yo`<tr><td>${key}</td><td>${JSON.stringify(state.data[key], null, 3)}</td></tr>`
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

