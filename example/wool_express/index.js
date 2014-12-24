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

var knit = require('knit')
knit(
    {_: 'express', $:'&'},
    {_: 'morgan', $:'&'},
    {bodyParser: 'body-parser', $:'&'},
    {_:'wool', $: '&'}
)
knit(function(wool, express, morgan, bodyParser) {    
    var db = __dirname + '/test.db'
    
    console.log('Starting...')
    
    var state = {changed :0, todos: []}
    
    wool()
    .dispatch([
        function(e) {
            console.log('Dispatching:',e)
        },
        {
            $: function (e) { return typeof e === 'object' && 'action' in e}
            ,
            _: function (e) {
                state.changed += 1 
                switch(e.action) {
                case 'add':
                    state.todos.push({done: false, task: e.task})
                    break
                case 'done':
                    state.todos[e.rank].done = true
                    break
                case 'undone':
                    state.todos[e.rank].done = false
                    break
                case 'del':
                    state.todos.splice(e.rank,1)
                    break
                }
            }
        }
    ])
    .withFile(db)
    .onReady(function() {
        console.log('Ready')
        var app = express()
        app.use(morgan('dev'))
        app.use(bodyParser.json())
        var router = express.Router()
        
        router.get('/state',function (q, s) { s.send(state) })
        router.post('/action', function(q, s){console.log('post', q.body); this.push(q.body); s.send(state) }.bind(this))
        
        router.use(express.static(__dirname + '/site'))
        app.use(router)
        app.listen(3000)
        console.log('Server Listening...')
    })
    .run()
})
