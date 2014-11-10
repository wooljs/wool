
var load = require( __dirname + '/../lib/load.js')

var loader = load(require('fs'), require('event-stream'))
    
loader(__dirname + '/test_load.db', function(obj, i) {
    console.log(i, obj)
}, function() {
    console.log('done')    
})
