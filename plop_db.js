

var mongo = require('mongodb');
/*
var db = require('db.js').inject(mongo, 'plop', 'localhost', 27017);
//*/

/*
db.ask('plip', function(collection) { collection.insert({plip:666}) });
//*/

/*
db.ask('plip', function(collection) {
	collection.insert({plip:666}, function() {
		collection.count(function(err, count) {
			console.log("There are " + count + " records.");
		});
		
		collection.find(function (err, cursor) {
			cursor.explain(function(err, doc) {
			  console.log("-------------------------- Explanation");
			  console.dir(doc);
			});
			cursor.each(function(err, item) {
				console.log('Item: ', item);
				if(item == null) return;
				console.log(item);
			});
		})
	})
});
//*/

//*
var Db = mongo.Db,
  Connection = mongo.Connection,
    Server = mongo.Server;

var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : Connection.DEFAULT_PORT;

console.log("Connecting to " + host + ":" + port);

var db = new Db('plop', new Server(host, port, {}), {});
db.open(function(err, con) {
	con.createCollection('plip',function() {
		// Fetch the collection test
		db.collection('plip', function(err, collection) {
			collection.find(function(err, cursor) {
				console.log("Printing docs from Cursor Each")
				cursor.each(function(err, doc) {
					if(doc != null) console.log("Doc from Each ");
					console.dir(doc);
				})        
				cursor.explain(function(err, doc) {
					console.log("-------------------------- Explanation");
					console.dir(doc);
					cursor.toArray(function(err, docs) {
						console.log("Printing docs from Array")
						docs.forEach(function(doc) {
							console.log("Doc from Array ");
							console.dir(doc);
						})
						db.close();
					})
				})
			})
		});
	});
});
//*/
