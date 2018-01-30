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

module.exports = prefixAll('auth',[{
  n: 'login',
  p: {
    userId: 1,
    pass: 1
  },
  c: function(t, param, cb) {
    var session = this.get(asSession(param.sessid))
    if (session) return cb('Session> session already set in store')
    var user = this.get(asUser(param.userId))
    if (! user) return cb('User> userId "'+param.userId+'" does not exist')
    if (user.pass !== param.pass) return cb('User> userId "'+param.userId+'" password does not match')
    return cb()
  },
  o: function(t, param, cb) {
    try {
      var e = new Date(t.getTime() + 2*60*1000) // set expiry within 2 minutes
      if (e.getTime() > Date.now()) return this.update(asSession(param.sessid), { userId: param.userId, expire: e }, cb)
      else return cb()
    } catch(e) {
      cb(e)
    }
  }
},{
  n: 'logout',
  p: {},
  c: function(t, param, cb) {
    var session = this.get(asSession(param.sessid))
    if (! session) return cb('Session> session must exist to logout')
    return cb()
  },
  o: function(t, param, cb) {
    try {
      this.remove(asSession(param.sessid), cb)
    } catch(e) {
      cb(e)
    }
  }
}])
