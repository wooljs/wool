
require('knit').inject(function(knit, mu2) {
	//console.log("knit:", knit.showConfig())
	
	mu2.compileText('test','{{#x}}here{{/x}}', function (err, template) {
		console.log(err)
		if (!err) {
			console.log('here')
			var stream = mu2.render(template, {a:1, x:[{n:'a'},{n:'b'},{n:'c'},{n:'d'}]})

			stream.on('data', function (d) { console.log(d) })
			stream.on('end',  function () { console.log('--done') })

			console.log('here')
		}
		/**/
	})
	
})
