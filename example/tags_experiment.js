
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

var template = tags(tmpl)

function bench(n) {
    console.time(n+' loop concat')
    for (var i = 0 ; i < n ; i+=1) {
        //**/fs.appendFileSync('test_concat.txt', 
            template({name: 'Plop'})
        //**/)
    }
    console.timeEnd(n+' loop concat')
}

var n = 100
bench(n)
bench(n*100)

