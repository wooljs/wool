/*
 * Copyright 2017 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
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
 * This file is a model of Rule file
 *
 */

const { prefixAll, asSession, asUser } = require('./prefix')

module.exports = prefixAll('admin', [{
  n: 'create_user',
  p: {
    userId: 1,
    pass: 1
  },
  c: function(t, param, cb) {
    var session = this.get(asSession(param.sessid))
    if (! session) return cb('Session> session must be set to create user')
    else if (session.userId !== 'root')  return cb('Session> session must be user admin to create user')
    var user = this.get(asUser(param.userId))
    if (user) return cb ('User> userId "'+param.userId+'" already exists')
    else return cb()
  },
  o: function(t, param, cb) {
    try {
      this.update(asUser(param.userId), { userId: param.userId, pass: param.pass }, cb)
    } catch(e) {
      cb(e)
    }
  }
}])
