function Node(v,p,n) { this.v = v; this.p = p; this.n = n }
Node.prototype.val = function() {if (arguments.length==0) { return this.v } else if (arguments[0] instanceof Node) { this.v = arguments[0]} else { throw new Error("Bad argument: "+arguments) } }
Node.prototype.next = function() {if (arguments.length==0) { return this.n } else if (arguments[0] instanceof Node) { this.n = arguments[0]} else { throw new Error("Bad argument: "+arguments) } }
Node.prototype.prev = function() {if (arguments.length==0) { return this.p } else if (arguments[0] instanceof Node) { this.p = arguments[0]} else { throw new Error("Bad argument: "+arguments) } }

function List(arr) { this.head = undefined; this.size = 0; var arr = arr||[]; arr.forEach(List.prototype.push.bind(this)) }
List.prototype.push = function(v) { if (typeof this.head === 'undefined') { this.head = new Node(v, null, null) } else if (this.head.prev() === null) { var x = new Node(v, this.head, this.head); this.head.next(x); this.head.prev(x) } else { var p = this.head.prev(); var x = new Node(v, p, this.head); p.next(x); this.head.prev(x) }; this.size += 1; }
List.prototype.pop = function() { if (typeof this.head !== 'undefined') { var p = this.head.prev(); var x = p.prev(); this.head.prev(x); x.next(this.head); this.size -= 1; return p.val() } }
List.prototype.unshift = function(v) { if (typeof this.head === 'undefined') { this.head = new Node(v, null, null) } else if (this.head.next() === null) { var x = new Node(v, this.head, this.head); this.head.next(x); this.head.prev(x) } else { var n = this.head.next(); var x = new Node(v, this.head, n); n.prev(x); this.head.next(x) }; this.size += 1; }
List.prototype.shift = function() { if (typeof this.head !== 'undefined') { var n = this.head.next(); var x = n.next(); this.head.next(x); x.prev(this.head); this.size -= 1; return p.val() } }
List.prototype.forEach = function(f) { if (typeof this.head !== 'undefined') { var x = this.head; do { f(x); x = x.next() } while (x !== null && x !== this.head); } }
List.prototype.map = function(f) { var res = new List(); this.forEach(function(v) { res.push(f(v)) }); return res }

//*
var arr = []
for (var i = 0; i<10000; i+=1) {
    arr.push(i)
}

var list = new List(arr)

function sqr(a) { return a * a }

function bench_map(n) {
    console.time(n+' loop map')
    for (var i = 0 ; i < n ; i+=1) {
        var t = arr.map(sqr)
    }
    console.timeEnd(n+' loop map')
    //console.log(t.length)
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
    //console.log(t.length)
}
function bench_for_check_key(n) {
    console.time(n+' loop for key')
    var t
    for (var i = 0 ; i < n ; i+=1) {
        t = []
        for (var a = 0, l = arr.length; a < l; a+=1) {
            if (a in arr) {
                var v = arr[a]
                t.push(sqr(v))
            }
        }
    }
    console.timeEnd(n+' loop for key')
    //console.log(t.length)
}

function bench_list(n) {
    console.time(n+' loop list')
    for (var i = 0 ; i < n ; i+=1) {
        var t = list.map(sqr)
    }
    console.timeEnd(n+' loop list')
    //console.log(t.length)
}

var n = 100
bench_map(n)
bench_for(n)
bench_for_check_key(n)
bench_list(n)
//*/