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
  , state = {connid:'-', command:{list:[], i: -1, cur: null}, variable: {}, data:{}}
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
        state.connid = m.d.connid
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
    if (('t' in m) && m.t === 'set') {
      document.getElementById(m.d.k).scrollIntoView()
    }
  })

function main(state) {
  var prefix = css`
    body {
      display: flex;
      min-height: 100vh;
      flex-direction: column;
    }
    :host > div {
      display: inline-block;
      vertical-align:top;
    }
    :host > .command {
      position: -webkit-sticky;
      position: sticky;
      top: 0;
      width: 280px;
    }
    :host > .data {
      position: relative;
      width: 520px;
    }
    :host > .data  pre{
      white-space: pre-wrap;
    }
    .action {
      color: blue;
      font-size: x-small;
      cursor: pointer;
    }
  `
  let savedParam = n => {
      return yo`<p>${n}: ${state.variable[n]} <span class="action" onclick=${onClickVarDel(n)}>x</span></p>`
    }
    , optionCommand = (cmd, i) => {
      return yo`<option value="${i}" selected=${state.command.i===i?'selected':''}>${cmd.n}</option>`
    }
    , isNotSaved = k => (!(k in state.variable))
    , inputParam = k => {
      if (state.command.cur.p[k]) return yo`<p>${k} <input type="text" id="param-${k}" name="${k}"> <span class="action" onclick=${onClickVarSet(k)}>^</span></p>`
      else return yo`<p>${k} <i>to be generated</i></p>`
    }
    , jsonData = key => {
      return yo`<li id=${key}>${key}<pre>${JSON.stringify(state.data[key], null, 3)}</pre></li>`
    }
  return yo`<div class="${prefix}">
    <div class="command">
      <p>connid: ${state.connid}</p>
      ${Object.keys(state.variable).map(savedParam)}
      <p>Command : <select onchange=${onChangeSelectCommand} id="command">
        <option value="-1" selected=${state.command.i===-1?'selected':''}>-</option>
        ${state.command.list.map(optionCommand)}
        </select>
      </p>
      ${state.command.cur?Object.keys(state.command.cur.p).filter(isNotSaved).map(inputParam):''}
      <button onclick=${onClickSend} disabled=${state.command.i===-1?'disabled':''}>send</button>
    </div>
    <div class="data">
      <ul>
        ${Object.keys(state.data).map(jsonData)}
      </ul>
    </div>
  </div>`
}

function onChangeSelectCommand(/*e*/) {
  const i = +document.getElementById('command').value
  state.command.i = i
  state.command.cur = i !== -1 ? state.command.list[i] : null
  console.log('Command selected: '+ state.command.i + ' ' + (state.command.cur?state.command.cur.n:''))
  const widget = main(state)
  yo.update(el, widget)
}

function onClickVarSet(k) {
  return function(/*e*/) {
    var v = document.getElementById('param-'+k).value
    if (v) {
      state.variable[k] = v
      const widget = main(state)
      yo.update(el, widget)
    }
  }
}

function onClickVarDel(k) {
  return function(/*e*/) {
    delete state.variable[k]
    const widget = main(state)
    yo.update(el, widget)
  }
}

function onClickSend(/*e*/) {
  if (client.readyState === client.OPEN) {
    if (state.command.cur !== null) {
      let m = {}
        , p = Object.entries(state.command.cur.p)

      m.t = 'command'
      m.n = state.command.cur.n
      m.d = {}

      var i = 0
        , l = p.length
      for (; i < l ; i++) {
        let k = p[i][0]
        if (state.command.cur.p[k]) {
          let c = p[i][1]
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
      }
      
      var payload = JSON.stringify(m)
      console.log('Sent: ' + payload)
      client.send(payload)
    }
  }
}

document.body.appendChild(el)

