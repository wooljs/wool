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
  , Checks = require('wool-validate')
  , UserID = Checks.Id('userId')
  , ChatID = Checks.Id('chatId')

module.exports = Rule.buildSet('chatroom', {
  name: 'create',
  param: [ UserID, ChatID.asNew() ],
  async run(store, param) {
    const { chatId, userId } = param
      , user = await store.get(userId)
    await store.set(chatId, { members: [ userId ], messages: [ '* Chatroom created by '+userId ] })
    user.membership.push(chatId)
    await store.set(userId, user)
  }
},{
  name: 'join',
  param: [ UserID, ChatID ],
  async cond(store, param) {
    const {chatId, userId} = param
      , chatroom = await store.get(chatId)
    if (chatroom.members.indexOf(userId) !== -1) throw new Checks.InvalidRuleError('Chatroom> member "'+userId+'" cannot join: already in')
    return true
  },
  async run(store, param) {
    const {chatId, userId} = param
      , chatroom = await store.get(chatId)
      , user = await store.get(userId)
    chatroom.members.push(userId)
    chatroom.messages.push('* Chatroom joined by '+userId)
    await store.set(chatId, chatroom)
    user.membership.push(chatId)
    await store.set(userId, user)
  }
},{
  name: 'leave',
  param: [ UserID, ChatID ],
  async cond(store, param) {
    const {chatId, userId} = param
      , chatroom = await store.get(chatId)
    if (chatroom.members.indexOf(userId) === -1) throw new Checks.InvalidRuleError('Chatroom> member "'+userId+'" cannot leave: not in')
    return true
  },
  async run(store, param) {
    const {chatId, userId} = param
      , chatroom = await store.get(chatId)
      , user = await store.get(userId)
    chatroom.members = chatroom.members.filter(u => u !== userId )
    chatroom.messages.push('* Chatroom left by '+userId)
    await store.set(chatId, chatroom)
    user.membership = user.membership.filter(x => x !== chatId)
  }
},{
  name: 'send',
  param: [ UserID, ChatID, Checks.Str('msg') ],
  async cond(store, param) {
    const {chatId, userId} = param
      , chatroom = await store.get(chatId)
    if (chatroom.members.indexOf(userId) === -1) throw new Checks.InvalidRuleError('Chatroom> member "'+userId+'" cannot send message: not in')
    return true
  },
  async run(store, param) {
    const {chatId, userId, msg} = param
      , chatroom = await store.get(chatId)
    chatroom.messages.push(userId + ': ' + msg)
    await store.set(chatId, chatroom)
  }
},{
  name: 'err',
  async run() {
    throw new Checks.InvalidRuleError('ERROR!')
  }
})
