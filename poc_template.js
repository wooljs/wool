
require('knit').config(function (bind) {
	bind('str_to_obj').to(require('./lib/str_to_obj.js')).is('builder')
	
}).inject(function(knit, mu2, util, str_to_obj) {
	//console.log("knit:", knit.showConfig())
	
	var data0 = {a:1, x:[{n:'a'},{n:'b'},{n:'c'},{n:'d'}]},
		data1 = str_to_obj("{\n\ta:1,\n\tx:[\n\t\t{n:'a'},\n\t\t{n:'b'},\n\t\t{n:'c'}\n\t\t,{n:'d'}\n\t]\n}")
	
	console.log(data0)
	console.log(data1)
	
	util.pump(mu2.renderText('{{a}}\n{{#x}}[{{n}}]\n{{/x}}', data0, {}), process.stdout)
	util.pump(mu2.renderText('{{a}}\n{{#x}}[{{n}}]\n{{/x}}', data1, {}), process.stdout)

	util.pump(mu2.compileAndRender('./test-template-resource/test.txt', data0), process.stdout)
	util.pump(mu2.compileAndRender('./test-template-resource/test.txt', data1), process.stdout)
	
	stream = mu2.compile('./test-template-resource/test.txt', function (err, template) {
		util.pump(mu2.render(template, data0), process.stdout)		
		util.pump(mu2.render(template, data1), process.stdout)		
	})
	
})
