
console.log(JSON.parse('"plop"'));

/*

[1,3].forEach(function(x){console.log(x);});
['a','aa'].forEach(function(x){console.log(x);});

var a = {u:1}

console.log(a.hasOwnProperty('u'));


var filters=[{'a':1},'b',function() {},'d','e'];

try {
filters.forEach(function (x,i) {
	console.log(i);
	console.log(x);
	throw false;
});
} catch (e) {
	console.log(e);
}


for (i = 0, l = filters.length, x = filters[i]; i < l ; x = filters[++i]) {
	console.log(i);
	console.log(x);
}
	
try {
	throw 'plop';
} catch (e) {
	console.log(e);
}

var numbers = [1, 2, 3, 4];  
var doubled = numbers.map(function(i) { return i * 2; });  

console.dir(doubled);


var filters=[0,1,2,3,4];


for (i = 0, l = filters.length, f = filters[i]; i < l ; f = filters[++i]) {
	console.log(i);
	if (f > 2) { return true; }
}


console.dir(require('url').parse('/status?name=ryan'));
console.dir(require('url').parse('http://localhost:8080/status?name=ryan'));

var fs = require('fs');

fs.stat('/caca',function (err, stats) {
	console.dir(err);
	console.dir(err.errno);
	console.dir(stats);
});
fs.stat('/root/.profile',function (err, stats) {
	console.dir(err);
	console.dir(err.errno);
	console.dir(stats);
});


var u = {};

u.plop = function() {}
console.dir(u);

//delete u['plop'];
delete u.plop;
console.dir(u);


url = [];
console.log(url instanceof Array);

rx = /x/g
console.log(rx instanceof RegExp);

*/
