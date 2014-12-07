'use strict'
var util = require('util')
var fs = require('fs')
var stream = require('stream')


function LineSplit() {
    if (!(this instanceof LineSplit))
        return new LineSplit();
    this.lastLine = ''
    stream.Transform.call(this, {encoding: 'utf8'})
}
util.inherits(LineSplit, stream.Transform)
LineSplit.prototype._transform = function (data, encoding, callback) {
    var p, c; p = c = 0
    while (c < data.length) {
        while (c < data.length && data[c] !== 0x0A) { c+=1 }
        if (data[c] === 0x0A) {
            this.lastLine += data.toString('utf8',p,c)
            this.push(this.lastLine)
            this.lastLine = ''
            c+=1
            p = c
        }
    }
    callback()
}
LineSplit.prototype._flush = function (callback) {
    if (this.lastLine.length > 0) this.push(this.lastLine)
    callback();
}

function LineJoin() {
    if (!(this instanceof LineJoin))
        return new LineJoin();
    stream.Transform.call(this, {encoding: 'utf8'})
}
util.inherits(LineJoin, stream.Transform)
LineJoin.prototype._transform = function(data, encoding, callback) {
    this.push(data.toString()+'\n')
    callback()
}

function JsonParse() {
    if (!(this instanceof JsonParse))
        return new JsonParse();
    this.lastLine = ''
    stream.Transform.call(this, {objectMode: true})
}
util.inherits(JsonParse, stream.Transform)
JsonParse.prototype._transform = function (data, encoding, callback) {
    this.push(JSON.parse(data.toString()))
    callback()
}

function JsonStringify() {
    if (!(this instanceof JsonStringify))
        return new JsonStringify();
    this.lastLine = ''
    stream.Transform.call(this, {objectMode: true})
}
util.inherits(JsonStringify, stream.Transform)
JsonStringify.prototype._transform = function (data, encoding, callback) {
    this.push(JSON.stringify(data))
    callback()
}

function EventQueue(dispatcher) {
    if (!(this instanceof EventQueue))
        return new EventQueue(dispatcher);
    this.dispatcher = dispatcher
    stream.Transform.call(this, {objectMode: true})
}
util.inherits(EventQueue, stream.Transform)
EventQueue.prototype._transform = function (data, encoding, callback) {
    this.dispatcher(data)
    this.push(data)
    callback()
}


fs.createReadStream(__dirname + '/test_load.db', {flags: 'r'})
.pipe(LineSplit())
.pipe(JsonParse())
.pipe(EventQueue(console.log.bind(null,'l:')))
.on('finish', function () {
        
    var es = EventQueue(console.log.bind(null,'q:'))

    es
    .pipe(JsonStringify())
    .pipe(LineJoin())
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
