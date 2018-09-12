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
  , { InvalidRuleError } = require('wool-validate')
  , { SessionID, UserID, Login, Password, AuthIndex } = require('./params')

module.exports = Rule.buildSet('admin', {
  name: 'create_user',
  param: [ SessionID, UserID.asNew(), Login, Password ],
  async cond(store, param) {
    let { sessid, userId, login } = param
      , session = await store.get(SessionID.as(sessid))
    if (session.role !== 'admin') throw new InvalidRuleError('session must be user admin to create user')
    let authIndex = await store.get(AuthIndex)
    if (login in authIndex) throw new InvalidRuleError('login "'+login+'" already exists')
    return true
  },
  async run(store, param) {
    let { userId, login, password } = param
      , authIndex = await store.get(AuthIndex)
    authIndex[login] = userId
    await store.set(AuthIndex, authIndex)
    await store.set(UserID.as(userId), { userId, login, password, role: 'user', membership: [] })
  }
})
