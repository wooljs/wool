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

const yo = require('yo-yo')
  , state = {sessid:'-', command:{list:[], i: -1, cur: null}, variable: {}, data:{}}
  , el = main(state)
  , css = require('sheetify')
  , client = require('./ws-client')(function(data) {
    console.log('Received: ' + data)
    var m = JSON.parse(data)
    if (Object.keys(m).length === 0) {
      alert('Empty message !')
    } else if ('err' in m) {
      alert(m.err)
    } else if ('t' in m) {
      switch(m.t) {
      case 'init': {
        state.sessid = m.d.sessid
        state.command.list = m.d.command.list
        state.data = m.d.data
      }
        break
      case 'set': {
        state.data[m.d.k] = m.d.v
      }
        break
      case 'del': {
        delete state.data[m.d.k]
      }
        break
      }
    }
    // construct a new list and efficiently diff+morph it into the one in the DOM
    const widget = main(state)
    yo.update(el, widget)
  })

function main(state) {
  var prefix = css`
    :host > div {
      display: inline-block;
      vertical-align:top;
    }
    :host > .command {
    }
    :host > .data {
    }
    .action {
      color: blue;
      font-size: x-small;
      cursor: pointer;
    }
  `
  return yo`<div class="${prefix}">
    <div class="command">
      <p>sessid: ${state.sessid}</p>
      ${Object.keys(state.variable).map(function(n) {
        return yo`<p>${n}: ${state.variable[n]} <span class="action" onclick=${onClickVarDel(n)}>x</span></p>`
      })}
      <p>Command : <select onchange=${onChangeSelectCommand} id="command">
        <option value="-1" selected=${state.command.i===-1?'selected':''}>-</option>
        ${state.command.list.map(function (cmd, i) { return yo`<option value="${i}" selected=${state.command.i===i?'selected':''}>${cmd.n}</option>` })}
        </select>
      </p>
      ${state.command.cur?Object.keys(state.command.cur.p).map(function (k) {
        if (!(k in state.variable)) return yo`<p>${k} (${state.command.cur.p[k]}) <input type="text" id="param-${k}" name="${k}"> <span class="action" onclick=${onClickVarSet(k)}>^</span></p>`
      }):''}
      <button onclick=${onClickSend} disabled=${state.command.i===-1?'disabled':''}>send</button>
    </div>
    <div class="data">
      <ul>
        ${Object.keys(state.data).map(function (key) {
          return yo`<li>${key} <pre>${JSON.stringify(state.data[key], null, 3)}</pre></li>`
        })}
      </ul>
    </div>
  </div>`
}

function onChangeSelectCommand(e) {
  const i = +document.getElementById('command').value
  state.command.i = i
  state.command.cur = i !== -1 ? state.command.list[i] : null
  console.log('Command selected: '+ state.command.i + ' ' + (state.command.cur?state.command.cur.n:''))
  const widget = main(state)
  yo.update(el, widget)
}

function onClickVarSet(k) {
  return function(e) {
    var v = document.getElementById('param-'+k).value
    if (v) {
      state.variable[k] = v
      const widget = main(state)
      yo.update(el, widget)
    }
  }
}

function onClickVarDel(k) {
  return function(e) {
    delete state.variable[k]
    const widget = main(state)
    yo.update(el, widget)
  }
}

function onClickSend(e) {
  if (client.readyState === client.OPEN) {
    if (state.command.cur !== null) {
      var m = {}
        , p = Object.entries(state.command.cur.p)

      m.t = 'command'
      m.n = state.command.cur.n
      m.d = {}

      var i = 0
        , l = p.length
      for (; i < l ; i++) {
        var k = p[i][0]
          , c = p[i][1]
          , v = k in state.variable ? state.variable[k] : document.getElementById('param-'+k).value
        if (v.length === 0) {
          if (c === 1) {
            alert('Param '+k+' is mandatory')
            return
          }
          // if (c === 0) DO NOTHING
        } else {
          m.d[k] = v
        }
      }

      var payload = JSON.stringify(m)
      console.log('Sent: ' + payload)
      client.send(payload)
    }
  }
}

document.body.appendChild(el)

