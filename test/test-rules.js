var rules = require('rules.js');

default_location = '/index.html';
urlparser = function (url) {
	return {
		href: url,
		search: '',
		query: '',
		pathname: url
	}
}

var r = rules.inject(default_location, urlparser);
var rest_rule = r[0];
var default_rule = r[1];
var static_rule = r[2];

function test_valid(url) {
	test.ok(rest_rule.valid({req:{'url':url}}),"must validate: "+url);
}
function test_not_valid(url) {
	test.ok( ! rest_rule.valid({req:{'url':url}}),"must not validate: "+url);
}

exports['should valid rest_rule'] = function (test) {
	test_valid('/j/');
	test_valid('/j/u');
	test_valid('/j/u/42');
	test_valid('/j/u/42?o=u');
	test.done();
};
exports['should not valid rest_rule'] = function (test) {
	test_not_valid('/');
	test_not_valid('/plop');
	test_not_valid('/plop/42');
	test_not_valid('/plop/42?o=u');
	test.done();
};
exports['should valid default_rule'] = function (test) {	
	test_valid('/');
	test.done();
};
exports['should not valid default_rule'] = function (test) {
	test_not_valid('/j/');
	test_not_valid('/j/u');
	test_not_valid('/j/u/42');
	test_not_valid('/j/u/42?o=u');
	test_not_valid('/plop');
	test_not_valid('/plop/42');
	test_not_valid('/plop/42?o=u');
	test.done();
};


exports['should run rest_rule'] = function (test) {
	test.ok(false,'test to be written');
	test.done();
};

exports['should run default_rule'] = function (test) {
	test.ok(false,'test to be written');
	test.done();
};
exports['should run static_rule'] = function (test) {
	test.ok(false,'test to be written');
	test.done();
};