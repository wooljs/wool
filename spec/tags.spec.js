/*
 * Copyright 2014 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *      
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

var
tags = require( __dirname + '/../lib/tags.js')()

describe("template testing", function() {
    "use strict"
    
    it("simple template", function() {
        var template = tags(function() {
            return div({id:'plop', _:'paf pouf'}, h1("Hello ", $('name'), "!"),
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
        });
        var res = template({name: 'Plop'})        
        expect(res).toEqual('<div id="plop" class="paf pouf"><h1>Hello Plop!</h1><ul><li>plip:1</li><li>plip:2</li><li>plip:3</li></ul><div><div>i:1</div><div>j:1*1</div><div>j:1*2</div><div>j:1*3</div><div>i:2</div><div>j:2*1</div><div>j:2*2</div><div>j:2*3</div><div>i:3</div><div>j:3*1</div><div>j:3*2</div><div>j:3*3</div></div></div>')
    });
    
    it("template with injected provider", function() {
        var template = tags(function(Store) {
            return div({id:'plop', _:'paf pouf'}, h1("Hello ", Store.name, "!"),
                ul(each(Store.plip,
                    li('plip:', $())
                )),
                div(
                    each({i: Store.i},
                        div('i:', $('i')),
                        each({j: Store.j},
                            div('j:', $('i'), '*', $('j'))
                        )
                    )
                )
            )
        });
        var Store = {}
        Store.name = tags.prop('Plop')
        Store.plip = tags.prop([1,2,3])
        Store.i = tags.prop([1,2,3])
        Store.j = tags.prop([1,2,3])
        var res = template(Store)
        expect(res).toEqual('<div id="plop" class="paf pouf"><h1>Hello Plop!</h1><ul><li>plip:1</li><li>plip:2</li><li>plip:3</li></ul><div><div>i:1</div><div>j:1*1</div><div>j:1*2</div><div>j:1*3</div><div>i:2</div><div>j:2*1</div><div>j:2*2</div><div>j:2*3</div><div>i:3</div><div>j:3*1</div><div>j:3*2</div><div>j:3*3</div></div></div>')
    });
})


/*

Store.<data>() : read data value
Store.<data>.listen(this) : this.notify will be called when data change (passing delta ?)

wool.prepare(function (User) { 
    return div('.content', h1(User.name), 
        ul(each(User.tasks,    // is each necessary ?
            li(checkbox($('checked')), $('name'))
        ))
      )
})

each([1,2..], function(t) { return li(...) }) // bof

each([1,2,..], 'e', p($('e.field')))

a({click: evq(..


*/

    