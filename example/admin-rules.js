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
  , { asSession, asUser } = require('./prefix')

module.exports = Rule.buildSet('admin', {
  name: 'create_user',
  param: {
    sessId: RuleParam.ID,
    userId: RuleParam.NEW_ID,
    pass: RuleParam.CRYPTO
  },
  async cond(store, param) {
    let { sessid, userId } = param
      , session = await store.get(asSession(sessid))
    if (! session) throw new Error('Session> session must be set to create user')
    else if (session.userId !== 'root') throw new Error('Session> session must be user admin to create user')
    let user = await store.get(asUser(userId))
    if (user) throw new Error('User> userId "'+userId+'" already exists')
    return true
  },
  async run(store, param) {
    let { userId, pass } = param
    await store.set(asUser(userId), { userId, pass, membership: [] })
  }
})
