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
    {_:'wool', $: '&'}
)
knit(function(wool, http) {
    var db = __dirname + '/test.db'
    
    console.log('Starting...')
    
    var state = {changed : 0, plop: null}
    
    wool()
    .dispatch([
        function(e) {
            console.log('in:',e)
        },
        {
            $: function (e) { return typeof e === 'object' && 'plop' in e}
            ,
            _: function (e) { state.changed+=1; state.plop = e.plop }
        }
    ])
    .withFile(db)
    .onReady(function() {
        console.log('Ready')
        var server = http.createServer(function(req, res) {
            switch(req.method) {
            case 'GET':
                res.writeHead(200, {'Content-Type': 'application/json'})
                res.end(JSON.stringify(state,2));
                return;
            case 'POST':
                req
                .pipe(wool.stream.JsonParse())
                .on('error', function(e) {
                    res.writeHead(400)
                    res.end(e.toString())
                })
                .pipe(this.pushStream())
                .on('finish', function() {                    
                    res.writeHead(202)
                    res.end()
                })            
            }
        }.bind(this))
        server.listen(3000)
        console.log('Server Listening...')
    })
    .run()
    
})


