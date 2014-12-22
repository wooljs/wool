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
    .fromFile(db)
    .toFile(db)
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
                .pipe(this.pushStream())
                res.writeHead(202)
                res.end()                
            }
        }.bind(this))
        server.listen(3000)
    })
    .run()
    
})


