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
const { Rule } = require('wool-rule')
  , { SessionID, UserID, Login, Passwd, AuthIndex } = require('./rule-params')

module.exports = Rule.buildSet('auth',{
  name: 'login',
  param: [ SessionID.asNew(), Login, Passwd ],
  async cond(store, param) {
    let { sessid, login, pass } = param
      , authIndex = await store.get(AuthIndex)
    if (!(login in authIndex)) throw new Error('login '+login+' is unknown')
    let userId = authIndex[login]
      , user = await store.get(UserID.as(userId))
    if (! user) throw new Error('user with '+login+', userId "'+userId+'" does not exist')
    if (user.pass !== pass) throw new Error('User> userId "'+userId+'" password does not match')
    param.userId = userId
    param.role = user.role
    return true
  },
  async run(store, param, t) {
    let { sessid, login, userId, role } = param
      , e = new Date(t.getTime() + 2*60*1000) // set expiry within 2 minutes
    await store.set(SessionID.as(sessid), { userId, login, role, expire: e })
  }
},{
  name: 'logout',
  param: [ SessionID ],
  async run(store, param) {
    let { sessid } = param
    await store.del(SessionID.as(sessid))
  }
},{
  name: 'clean_old',
  async run(store, param, t) {
    store.db.forEach((v, k) => {
      if (SessionID.isOne(k) && v.get().expire.getTime() < t.getTime() ) store.del(k)
    })
  }
})
