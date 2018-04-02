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
  , { SessionID, UserID, ChatID, Msg } = require('./rule-params')

module.exports = Rule.buildSet('chatroom', {
  name: 'create',
  param: [ SessionID, ChatID.asNew() ],
  async run(store, param) {
    let { sessid, chatId } = param
      , { userId } = await store.get(SessionID.as(sessid))
      , user = await store.get(UserID.as(userId))
    await store.set(ChatID.as(chatId), { members: [ userId ], messages: [ '* Chatroom created by '+userId ] })
    user.membership.push(chatId)
    param.chatId = chatId
    await store.set(UserID.as(userId), user)
  }
},{
  name: 'join',
  param: [ SessionID, ChatID ],
  async cond(store, param) {
    let { sessid, chatId } = param
      , { userId } = await store.get(SessionID.as(sessid))
      , chatroom = await store.get(ChatID.as(chatId))
    if (chatroom.members.indexOf(userId) !== -1) throw new Error('Chatroom> member "'+userId+'" cannot joiname: already in')
    return true
  },
  async run(store, param) {
    let { sessid, chatId} = param
      , { userId } = await store.get(asSession(sessid))
      , user = await store.get(UserID.as(userId))
      , chatroom = await store.get(ChatID.as(chatId))
    chatroom.members.push(userId)
    chatroom.messages.push('* Chatroom joined by '+userId)
    await store.set(ChatID.as(chatId), chatroom)
    user.membership.push(chatId)
    await store.set(UserID.as(userId), user)
  }
},{
  name: 'leave',
  param: [ SessionID, ChatID ],
  async cond(store, param) {
    let { sessid, chatId } = param
      , { userId } = await store.get(asSession(sessid))
      , chatroom = await store.get(ChatID.as(chatId))
    if (chatroom.members.indexOf(userId) === -1) throw new Error('Chatroom> member "'+userId+'" cannot leave: not in')
    return true
  },
  async run(store, param) {
    let { sessid, chatId } = param
      , { userId } = await store.get(asSession(sessid))
      , user = await store.get(UserID.as(userId))
      , chatroom = await store.get(ChatID.as(chatId))
    chatroom.members = chatroom.members.filter(u => u !== userId)
    chatroom.messages.push('* Chatroom left by '+userId)
    await store.set(ChatID.as(chatId), chatroom)
    user.membership = user.membership.filter(x => x !== chatId)
    await store.set(UserID.as(userId), user)
  }
},{
  name: 'send',
  param: [ SessionID, ChatID, Msg ],
  async cond(store, param) {
    let { sessid, chatId } = param
      , { userId } = await store.get(asSession(sessid))
      , chatroom = await store.get(ChatID.as(chatId))
    if (chatroom.members.indexOf(userId) === -1) throw new Error('Chatroom> member "'+userId+'" cannot send message: not in')
    return true
  },
  async run(store, param) {
    let { sessid, chatId, msg } = param
      , { userId } = await store.get(asSession(sessid))
      , chatroom = await store.get(ChatID.as(chatId))
    chatroom.messages.push(userId + ': ' + msg)
    await store.set(ChatID.as(chatId), chatroom)
  }
})
