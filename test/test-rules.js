var rules = require('rules.js');

var default_location = '/index.html';
var urlparser = function (url) {
	return {
		href: url,
		search: '',
		query: '',
		pathname: url
	}
}
var rest = function() {}
var fs = {
	readFile: function () {},
	stat: function () {}
}
var mime = function () {}

var rest_rule = rules.rest(rest);
var static_rule = rules.static(default_location, urlparser, mime, fs);

function test_valid(test, rule, url) {
	test.ok(rule.valid({req:{'url':url}}),"must validate: "+url);
}
function test_not_valid(test, rule, url) {
	test.ok( ! rule.valid({req:{'url':url}}),"must not validate: "+url);
}

exports['should valid rest_rule'] = function (test) {
	test_valid(test, rest_rule, '/j/');
	test_valid(test, rest_rule, '/j/u');
	test_valid(test, rest_rule, '/j/u/42');
	test_valid(test, rest_rule, '/j/u/42?o=u');
	test.done();
};
exports['should not valid rest_rule'] = function (test) {
	test_not_valid(test, rest_rule, '/');
	test_not_valid(test, rest_rule, '/plop');
	test_not_valid(test, rest_rule, '/plop/42');
	test_not_valid(test, rest_rule, '/plop/42?o=u');
	test.done();
};

exports['should run rest_rule'] = function (test) {
	test.ok(false,'test to be written');
	test.done();
};
exports['should run static_rule'] = function (test) {
	test.ok(false,'test to be written');
	test.done();
};
