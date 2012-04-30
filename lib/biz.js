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
 
/**
 * 
 * db: provide way to exchange wih dbms
 * validator: given a type, validate and prepare data from outside before integration  
 * mapping: given an external name, provide the name of an entity type accessible from outside
 * 
 * 
 */  
 
exports.inject = function (db) {
	return {
		build: function (validator, mapping) {
			var memoizer = {}
			
			var internal = function (t) {
				var h = memoizer[t]
				if (typeof h === 'undefined') {
					console.log(Date(),'t:',t)
					var col = db.col(t)
					var val = validator(t)
					h = {
						getById: function(id,cb) {col.find({_id: db.objectId(id)},cb)},
						find: function(crit,cb) {col.find(crit,cb)},
						save: function(obj,cb) {
							val.check(obj,h,function (err) {
								if (err) cb(err);
								else val.prepare(obj, function(obj) { col.save(obj,cb) })
							})
						},
						remove: function(id,cb) {col.remove({_id: db.objectId(id)},cb)}
					}
					memoizer[t] = h
				}
				return h
			}

			return {
				login: function (l, cb) {
					internal('user').find({'login':l.l},function(err,docs) {
						if(err) {
							console.error(Date(),'While retrieving user',err)
							setTimeout(function() {cb({status:500})}, 1000)
						} else if (docs.length>0) {
							var v = docs[0]
							if(validator('login').compare(l,v)) {
								console.log(Date(), "Accepted user ", l.l, "creating session")
								internal('session').save({'user':v._id},function(err,session) {
									if (err) {
										console.error(Date(),'While creating session',err)
										setTimeout(function() {cb({status:500})}, 1000)
									}
									else {
										console.log(Date(), "Session created for user ", l.l, ":", session._id)
										cb(undefined,session._id)
									}
								})
							} else {
								console.error(Date(),'refuse invalid password',l)
								setTimeout(function() {cb({status:401})}, 1000)
							}
						} else {
							console.error(Date(),'refuse invalid login',l)
							setTimeout(function() {cb({status:401})}, 1000)		
						}
					})
				},
				auth: function (sid, path, cb) {
					
				},
				on: function (ext_name) {
					var t = mapping.find(ext_name)
					return internal(t)
				}
			}
		}
	}
}
