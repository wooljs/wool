
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
            return '<' + tagName + '>' + v.map(parse(x)).join('') + '</' + tagName + '>'
        }
    }
}

var h1 = build_block('h1')
var div = build_block('div')
var ul = build_block('ul')
var li = build_block('li')

function each() {
    var v = Array.prototype.slice.call(arguments)
    var arr = v.shift()
    return function() {
        return arr.map(function(e) {
            return v.map(parse(e)).join('')
        }).join('')
    }
}

function $() {
    return function(x) {
        return x
    }
}


console.log (
    div(h1("plop"),
        ul(each([1,2,3],
            li('plip:', $())
        ))
    )()
)
