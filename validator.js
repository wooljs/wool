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

exports.inject = function(crypto) {
	return function(t) {
		var common = {
			prepare: function(o,cb) {
				if (typeof o['creationDate']==='undefined') o.creationDate=new Date();
				if (typeof o['lastModificationDate']==='undefined') o.lastModificationDate=new Date();
				cb(o);
			}
		}
		return { 
			'user':{
				check: function(o) {
					return o.pwd_1===o.pwd_2;
				},
				prepare: function(o,cb) {
					o.password=crypto.SHA1(o.pwd_1);
					delete o.pwd_1;
					delete o.pwd_2;
					common.prepare(o,cb);
				}
			},
			'login':{
				compare: function(l,u) {
					console.log(Date(),'l.l',l.l,'crypto.SHA1(l.p)',crypto.SHA1(l.p));
					console.log(Date(),'u',u);
					return l.l===u.login && crypto.SHA1(l.p)===u.password;
				}
			},
			'session':{
				check: function (o) {
					return typeof o['user']!=='undefined';
				},
				prepare: function(o,cb) {
					common.prepare(o,cb);
				}
			}
		}[t];
	}
}
