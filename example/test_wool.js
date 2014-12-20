'use strict'
var wool = require( __dirname + '/../lib/index.js')

wool()
.dispatch(function(e) {
    console.log('x:',e)  
})
.fromFile(__dirname + '/test_load.db')
.toFile(__dirname + '/test_save.db')
.onReady(function() {
    console.log('here')
    this.push({yo:"yeah"})
    this.push({plip:{paf:'pouf'}})
    this.push(42)
    this.push("paf")
})
.run()
