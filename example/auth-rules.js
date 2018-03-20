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
const { Store } = require('wool-store')
  , { Rule, RuleParam } = require('wool-rule')
  , { asSession, isSession, asUser } = require('./prefix')

module.exports = Rule.buildSet('auth',{
  name: 'login',
  param: {
    sessId: RuleParam.ID,
    userId: RuleParam.ID,
    pass: RuleParam.CRYPTO
  },
  async cond(store, param) {
    let { sessid, userId, pass } = param
      , session = await store.get(asSession(sessid))
    if (session) throw new Error('Session> session already set in store')
    var user = await store.get(asUser(userId))
    if (! user) throw new Error('User> userId "'+userId+'" does not exist')
    if (user.pass !== pass) throw new Error('User> userId "'+userId+'" password does not match')
    return true
  },
  async run(store, param, t) {
    let { sessid, userId } = param
      , e = new Date(t.getTime() + 2*60*1000) // set expiry within 2 minutes
    //if (e.getTime() > Date.now())
    await store.set(asSession(sessid), { userId, expire: e })
  }
},{
  name: 'logout',
  param: {
    sessId: RuleParam.ID,
  },
  async cond(store, param) {
    let { sessid } = param
      , session = await store.get(asSession(sessid))
    if (! session) throw new Error('Session> session must exist to logout')
    return true
  },
  async run(store, param) {
    let { sessid } = param
      , session = await store.get(asSession(sessid))
    if (session) await store.del(asSession(sessid))
  }
},{
  name: 'clean_old',
  param: {},
  async run(store, param, t) {
    store.db.forEach((v, k) => {
      if (isSession(k) && v.get().expire.getTime() < t.getTime() ) store.del(k)
    })
  }
})
