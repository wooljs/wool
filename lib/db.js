/*
 * Copyright 2012 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *      
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */
 
 
exports.inject = function (mongodb, db_name, host, port) {
	db_name = db_name || 'test'
	host = host || 'localhost'
	port = port || mongodb.Connection.DEFAULT_PORT
	
	var ask = function (col_name, callback) {
		var db = new mongodb.Db(db_name, new mongodb.Server(host, port))
		db.open(function(err, con) {
			con.createCollection(col_name, function() {
				db.collection(col_name, function(error, collection) {
					if (typeof error!='undefined' && error != null) console.log('ERROR:',error)
					callback(collection,function(){db.close()})
				})	
			})	
		})
	}
	return {
		objectId: function(id) { return new mongodb.ObjectID(id) }
		,
		col: function (col_name) {
			return {
				find: function (request,cb) {
					ask(col_name, function (collection,close) {
						if (typeof request == 'string') request = {q:request}
						if (typeof request != 'object') throw "Unsupported request: "+request
						if (typeof request['o'] !='object') request.o={}
						var cursor = collection.find(request.q,request.o)
						cursor.toArray(function(err, docs) {
							cb(err,docs)
							close()
						})
					})
				},
				save: function (obj,cb) {
					ask(col_name, function (collection,close) {
						collection.save(obj,cb)
						close()
					})
				},
				remove: function (id,cb) {
					ask(col_name, function (collection,close) {
						collection.remove(id)
						cb()
						close()
					})			
				},
				query: function(callback) {
					ask(col_name,callback)
				}
			}
		}
	}
}
