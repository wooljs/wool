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

module.exports = function () {
    
    function foreach(elements, f) {
        //elements.forEach(f)
        for (var i = 0, l = elements.length ; i < l ; i+=1) { f(elements[i]) }
    }
    
    function mapjoin(elements, f) {
        //return elements.map(f).join('')
        //*
        var res = ''
        for (var i = 0, l = elements.length ; i < l ; i+=1) { res += f(elements[i]) }
        return res
        //*/
    }
    
    function mappush(elements, f) {
        //return elements.map(f)
        //*
        var res = []    
        for (var i = 0, l = elements.length ; i < l ; i+=1) { res.push(f(elements[i])) }
        return res
        //*/
    }
    
    function mapflatten(elements, f) {
        //return elements.map(f).reduce(function (p,c) { Array.prototype.push.apply(p,c); return p }, [])
        //*
        var res = []    
        for (var i = 0, l = elements.length ; i < l ; i += 1) { var r = f(elements[i]); for (var j = 0, m = r.length ; j < m ; j += 1) { res.push(r[j]) } }
        return res
        //*/
    }

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
                    return formatter.block(tagName, mappush(v,parse(x)))
                }
            }
        }
    }
    function build_single(tagName) {
        return function () {        
            var v = Array.prototype.slice.call(arguments)
            return function (x) {    
                return function (formatter) {
                    return formatter.open_block(tagName, mappush(v,parse(x)))
                }
            }
        }
    }

    var formatter = {
        block : function (tagName, elements) { return this.open_block(tagName) + this.children(elements) + this.close_block(tagName) },
        open_block: function (tagName) { return '<' + tagName + '>' },
        close_block: function (tagName) { return '</' + tagName + '>' },
        children : function (elements) { 
            return mapjoin(elements, function(e) {return typeof e === 'function' ? e(this) : e }.bind(this))
        }
    }
    
    function each() {
        var v = Array.prototype.slice.call(arguments)
        var arr = v.shift(), k = '_'
        if (! (arr instanceof Array)) {
           k = Object.keys(arr)[0]
           arr = arr[k]
        }
        return function(x) {
            return function (formatter) {
                return formatter.children(mapflatten(arr,  function(e) { var y = {}; foreach(Object.keys(x), function(k) {y[k] =  x[k]}); y[k] = e; return mappush(v,parse(y))}))
            }
        }
    }

    function $(k) {
        k = k || '_'
        return function(x) {
            return x[k]
        }
    }
    
    var blocks = [
        'html', 'head', 
        'title', 'script', 'noscript', 'style',
        'body', 'div', 'pre', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'dl', 'dt', 'dd', 'ul', 'ol', 'li',
        'del', 'ins', 'a', 'abbr', 'dfn', 'em', 'strong', 'sub', 'sup',
        'b', 'i', 'u', 's', 'tt',
        'form', 'button', 'fieldset', 'label', 'legend', 'select', 'option', 'optgroup', 'textarea',
        'table', 'thead', 'tbody', 'tfoot', 'th', 'tr', 'td', 'col', 'colgroup', 'caption',
        'address', 'blockquote', 'center', 'code','map', 'object', 'iframe'
    ];
    var single = [ 'base', 'link', 'meta', 'hr', 'br', 'area', 'param', 'input', 'img' ];
    
    var tags = {}
    foreach(blocks,function (e) { tags[e] =  build_block(e) })
    foreach(single, function (e) { tags[e] =  build_single(e) })
    
    tags.each = each
    tags.$ = $
    
    var funRx = /function\s*(\w*)\s*\((.*?)\)\s*\{([\s\S]*)\}/m;
    var tagRx = new RegExp('((?:\\$|each|'+blocks.join('|')+'|'+single.join('|')+')\\s*\\()','gm')
    
    function format(f) {
        var res
        f.toString().replace(funRx, function(_0, name, param, body) {
            body = body.replace(tagRx,'tags.$1')
            var f = new Function('tags', body)
            res = function(ctx) {
                return f(tags)(ctx)(formatter)
            }
        })
        return res
    }
        
    format.tags = tags
    
    return format
}