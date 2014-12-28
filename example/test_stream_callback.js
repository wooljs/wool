'use strict'
var util = require('util')
var fs = require('fs')
var stream = require('stream')
var ws = require( __dirname + '/../lib/wool_stream.js')(util,stream)

var es = ws.StreamDispatch(function(data) {
    console.log('q:', data)
    if (typeof data === 'object' && 'cb' in data && typeof data.cb === 'function') {
        data.cb('plouf')
        delete data.cb
    }
})

es
.pipe(ws.JsonStringify())
.pipe(ws.StreamJoin())
.pipe(process.stdout)

es.write({yo:"yeah"})
es.write({plip:{paf:'pouf'}, cb: console.log.bind(null,'x:')})
es.write(42)
es.write("paf")
