
function parse(x) {
    return function(o) {
        switch (typeof o) {
        case 'string':
            return o;
        case 'function':
            return o(x)
        }
    }
}
function build_block(tagName) {
    return function () {        
        var v = Array.prototype.slice.call(arguments)
        return function (x) {    
            return function (formatter) {
                return formatter.block(tagName, v.map(parse(x)))
            }
        }
    }
}

var formatter = {
    block : function (tagName, elements) { return this.open_block(tagName) + this.children(elements) + this.close_block(tagName) },
    open_block: function (tagName) { return '<' + tagName + '>' },
    close_block: function (tagName) { return '</' + tagName + '>' },
    children : function (elements) { return elements.map(function(e) {return typeof e === 'function' ? e(this) : e }.bind(this)).join('') }
}

/*
var i, l = v.length;
for (i = 0; i < l; i += 1) {
    
}
*/

var h1 = build_block('h1')
var div = build_block('div')
var ul = build_block('ul')
var li = build_block('li')

function each() {
    var v = Array.prototype.slice.call(arguments)
    var arr = v.shift(), k = '_'
    if (! (arr instanceof Array)) {
       k = Object.keys(arr)[0]
       arr = arr[k]
    }
    return function(x) {
        return function (formatter) {
            return formatter.children(
                arr
                .map(function(e) { var y = {}; Object.keys(x).forEach(function(k) {y[k] =  x[k]}); y[k] = e; return v.map(parse(y))})
                .reduce(function (p,c) { Array.prototype.push.apply(p,c); return p }, [])
            )
        }
    }
}

function $(k) {
    k = k || '_'
    return function(x) {
        return x[k]
    }
}


var template = div(h1("Hello ", $('name'), "!"),
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

console.log (
    template({name: 'Plop'})(formatter)
)

function bench(n) {
    console.time(n+' loop')
    for (var i = 0 ; i < n ; i+=1) {
        template({name: 'Plop'})(formatter)
    }
    console.timeEnd(n+' loop')
}

bench(100)
bench(1000)
//bench(1000000)

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
