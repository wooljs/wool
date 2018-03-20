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
  , { asSession, asUser, asChatroom } = require('./prefix')

module.exports = Rule.buildSet('chatroom', {
  name: 'create',
  param: {
    sessId: RuleParam.ID,
    chatId: RuleParam.NEW_ID
  },
  async cond(store, param) {
    let { sessid } = param
      , session = await store.get(asSession(sessid))
    if (! session) throw new Error('Session> session must be set to create chatroom')
    return true
  },
  async run(store, param) {
    let { sessid, chatId } = param
      , session = await store.get(asSession(sessid))
      , { userId } = session
      , user = await store.get(asUser(userId))
    chatId = chatId || Store.newId()
    await store.set(asChatroom(chatId), { members: [ userId ], messages: [ '* Chatroom created by '+userId ] })
    user.membership.push(chatId)
    param.chatId = chatId
    await store.set(asUser(userId), user)
  }
},{
  name: 'join',
  param: {
    sessId: RuleParam.ID,
    chatId: RuleParam.ID
  },
  async cond(store, param) {
    let { sessid, chatId } = param
      , session = await store.get(asSession(sessid))
    if (! session) throw new Error('Session> session must be set to join chatroom')
    let { userId } = session
      , chatroom = await store.get(asChatroom(chatId))
    if (! chatroom) throw new Error('Chatroom> invalid chatId')
    if (chatroom.members.indexOf(userId) !== -1) throw new Error('Chatroom> member "'+userId+'" cannot joiname: already in')
    return true
  },
  async run(store, param) {
    let { sessid, chatId} = param
      , session = await store.get(asSession(sessid))
      , { userId } = session
      , user = await store.get(asUser(userId))
      , chatroom = await store.get(asChatroom(chatId))
    chatroom.members.push(userId)
    chatroom.messages.push('* Chatroom joined by '+userId)
    await store.set(asChatroom(chatId), chatroom)
    user.membership.push(chatId)
    await store.set(asUser(userId), user)
  }
},{
  name: 'leave',
  param: {
    sessId: RuleParam.ID,
    chatId: RuleParam.ID
  },
  async cond(store, param) {
    let { sessid, chatId } = param
      , session = await store.get(asSession(sessid))
    if (! session) throw new Error('Session> session must be set to leave chatroom')
    let { userId } = session
      , chatroom = await store.get(asChatroom(chatId))
    if (! chatroom) throw new Error('Chatroom> invalid chatId')
    if (chatroom.members.indexOf(userId) === -1) throw new Error('Chatroom> member "'+userId+'" cannot leave: not in')
    return true
  },
  async run(store, param) {
    let { sessid, chatId } = param
      , session = await store.get(asSession(sessid))
      , { userId } = session
      , user = await store.get(asUser(userId))
      , chatroom = await store.get(asChatroom(chatId))
    chatroom.members = chatroom.members.filter(u => u !== userId)
    chatroom.messages.push('* Chatroom left by '+userId)
    await store.set(asChatroom(chatId), chatroom)
    user.membership = user.membership.filter(x => x !== chatId)
    await store.set(asUser(userId), user)
  }
},{
  name: 'send',
  param: {
    sessId: RuleParam.ID,
    chatId: RuleParam.ID,
    msg: RuleParam.STR
  },
  async cond(store, param) {
    let { sessid, chatId } = param
      , session = await store.get(asSession(sessid))
    if (! session) throw new Error('Session> session must be set to send message')
    let { userId } = session
      , chatroom = await store.get(asChatroom(chatId))
    if (! chatroom) throw new Error('Chatroom> invalid chatId')
    if (chatroom.members.indexOf(userId) === -1) throw new Error('Chatroom> member "'+userId+'" cannot send message: not in')
    return true
  },
  async run(store, param) {
    let { sessid, chatId, msg } = param
      , session = await store.get(asSession(sessid))
      , { userId } = session
      , chatroom = await store.get(asChatroom(chatId))
    chatroom.messages.push(userId + ': ' + msg)
    await store.set(asChatroom(chatId), chatroom)
  }
})
