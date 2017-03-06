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
  , numbers = [] // start empty
  , el = list(numbers, update)
  , client = require('./app/ws-client')(function(data) {
      console.log("Received: '" + data + "'")
      numbers.push(data)
      // construct a new list and efficiently diff+morph it into the one in the DOM
      var newList = list(numbers, update)
      yo.update(el, newList)
  })
  
function list (items, onclick) {
  return yo`<div>
    Random Numbers
    <button onclick=${onclick}>Add Random Number</button>
    <ul>
      ${items.map(function (item) {
        return yo`<li>${item}</li>`
      })}
    </ul>
  </div>`
}

function update () {
  // add a new random number to our list
  
  if (client.readyState === client.OPEN) {
    var number = Math.round(Math.random() * 0xFFFFFF)
    console.log("Sent: '" + number.toString() + "'")
    client.send(number.toString())
  }
}

document.body.appendChild(el)

