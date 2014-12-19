'use strict'
var util = require('util')
var fs = require('fs')
var stream = require('stream')
var ws = require( __dirname + '/../lib/wool_stream.js')(util,stream)


fs.createReadStream(__dirname + '/test_load.db', {flags: 'r'})
.pipe(ws.StreamSplit())
.pipe(ws.JsonParse())
.pipe(ws.StreamDispatch(console.log.bind(null,'l:')))
.on('finish', function () {
        
    var es = ws.StreamDispatch(console.log.bind(null,'q:'))

    es
    .pipe(ws.JsonStringify())
    .pipe(ws.StreamJoin())
    .pipe(process.stdout)

    es.write({yo:"yeah"})
    es.write({plip:{paf:'pouf'}})
    es.write(42)
    es.write("paf")
    
})
