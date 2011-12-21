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

exports['should valid rest_rule'] = function (test) {	
	test_valid = function(url) {
		test.ok(rest_rule.valid({req:{'url':url}}),url);
	}
	
	test_valid('/j/');
	test_valid('/j/u');
	test_valid('/j/u/42');
	test_valid('/j/u/42?o=u');
    test.done();
};
