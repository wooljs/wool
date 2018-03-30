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
  , { SessionID, UserID, Login, Passwd, Logins } = require('./rule-params')

module.exports = Rule.buildSet('admin', {
  name: 'create_user',
  param: [ SessionID, UserID.asNew(), Login, Passwd ],
  async cond(store, param) {
    let { sessid, userId, login } = param
      , session = await store.get(SessionID.as(sessid))
    if (session.role !== 'admin') throw new Error('session must be user admin to create user')
    let logins = await store.get(Logins)
    if (login in logins) throw new Error('login "'+login+'" already exists')
    return true
  },
  async run(store, param) {
    let { userId, login, pass } = param
      , logins = await store.get(Logins)
    logins[login] = userId
    await store.set(Logins, logins)
    await store.set(UserID.as(userId), { login, pass, role: 'user', membership: [] })
  }
})
