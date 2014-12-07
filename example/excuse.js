#!/usr/bin/env node

'use strict'
var request = require('request')
var stream = require('stream')
var util = require('util')

function Filter() {
    if (!(this instanceof Filter))
        return new Filter();
    this.str = ''
    this.rx = /^[\s\S]*<body>[\s\S]*<div class="wrapper">[\s\S]*<div class="quote">([\s\S]*?)<\/div>[\s\S]*<\/body>[\s\S]*$/m
    stream.Transform.call(this, {encoding: 'utf8'})
}
util.inherits(Filter, stream.Transform)
Filter.prototype._transform = function (data, encoding, callback) {
    this.str += data.toString()
    callback();
}
Filter.prototype._flush = function (callback) {
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
