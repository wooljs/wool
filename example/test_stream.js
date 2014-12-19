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



/*
fs.createReadStream(__dirname + '/test_load.db', {flags: 'r'})
.pipe(LineSplit())
.pipe(JsonParse())
.pipe(JsonStringify())
.pipe(LineJoin())
.pipe(process.stdout)
//*/

/*

function Loader() {
    if (!(this instanceof Loader))
        return new Loader();
    this.lastLine = ''
    stream.Transform.call(this, {encoding: 'utf8'})
}
util.inherits(Filter, stream.Transform)
Loader.prototype._transform = function (data, encoding, callback) {
    var p = c = 0
    while (c < data.length) {
        while (c < data.length && data[c] !== \u000A) { c+=1 }
        if (data[c] === \u000A) {
            this.lastLine += data.toString('utf8',p,c)
        }
    }
    
    for ( ;  ; i+=1) {
        
    }
    
    this
    
    callback();
}
Loader.prototype._flush = function (callback) {
    var res = this.str.replace(this.rx, function(_0, _1) {
        return _1.trim();
    })
    this.push(res)
    callback();
}

request
.get("http://www.excusesdedev.com/")
.pipe(Filter())
.pipe(process.stdout)

*/
