
var
fs = require('fs'),
tags = require( __dirname + '/../lib/tags.js')()

function tmpl() {
    return div(h1("Hello ", $('name'), "!"),
        ul(each([1,2,3],
            li('plip:', $())
        )),
        div(
            each({i: [1,2,3]},
                div('i:', $('i')),
                each({j: [1,2,3]},
                    div('j:', $('i'), '*', $('j'))
                )
            )
        )
    )
}

var template_concat = tags(tmpl)
/**/var template_stream = tags(tmpl)

function bench(n) {
    console.time(n+' loop concat')
    for (var i = 0 ; i < n ; i+=1) {
        /**/fs.appendFileSync('test_concat.txt', 
            template_concat({name: 'Plop'})
        /**/)
    }
    console.timeEnd(n+' loop concat')
}

//*
function bench_stream(n) {
    console.time(n+' loop stream')
    var s = fs.createWriteStream('test_stream.txt', {flags: 'a'})
    for (var i = 0 ; i < n ; i+=1) {
        template_stream.toStream(s)({name: 'Plop'})
    }
    s.end('')
    console.timeEnd(n+' loop stream')
}
//*/

var n = 1000
bench(n)
//bench(n*100)
bench_stream(n)


/*
var arr = []
for (var i = 0; i<10000; i+=1) {
    arr.push(i)
}

function sqr(a) { return a * a }

function bench_map(n) {
    console.time(n+' loop map')
    for (var i = 0 ; i < n ; i+=1) {
        var t = arr.map(sqr)
    }
    console.timeEnd(n+' loop map')
    console.log(t.length)
}

function bench_for(n) {
    console.time(n+' loop for')
    var t
    for (var i = 0 ; i < n ; i+=1) {
        t = []
        for (var a = 0, l = arr.length; a < l; a+=1) {
            var v = arr[a]
            t.push(sqr(v))
        }
    }
    console.timeEnd(n+' loop for')
    console.log(t.length)
}

bench_map(10000)
bench_for(10000)
//*/