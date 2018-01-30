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


const { prefixAll, asSession, asUser, asChatroom } = require('./prefix')

module.exports = prefixAll('chatroom', [{
  n: 'create',
  p: {},
  c: function(t, param, cb) {
    var session = this.get(asSession(param.sessid))
    if (! session) return cb('Session> session must be set to create chatroom')
    return cb()
  },
  o: function(t, param, cb) {
    var userId = this.get(asSession(param.sessid)).userId
    try {
      this.create(asChatroom, { members: [ userId ], messages: [ '* Chatroom created by '+userId ] }, cb)
    } catch(e) {
      cb(e)
    }
  }
},{
  n: 'join',
  p: {
    chatId: 1
  },
  c: function(t, param, cb) {
    var session = this.get(asSession(param.sessid))
    if (! session) return cb('Session> session must be set to join chatroom')
    var userId = session.userId
      , chatId = param.chatId
    var chatroom = this.get(chatId)
    if (! chatroom) return cb('Chatroom> invalid chatId')
    else if (chatroom.members.indexOf(userId) !== -1) return cb('Chatroom> member "'+userId+'" cannot join: already in')
    
    return cb()
  },
  o: function(t, param, cb) {
    var userId = param.userId = session.userId
      , chatId = param.chatId
    try {
      var chatroom = this.get(chatId)
      chatroom.members.push(userId)
      chatroom.messages.push('* Chatroom joined by '+userId)
      this.update(chatId, chatroom, cb)
    } catch(e) {
      cb(e)
    }
  }
},{
  n: 'leave',
  p: {
    chatId: 1
  },
  c: function(t, param, cb) {
    var session = this.get(asSession(param.sessid))
    if (! session) return cb('Session> session must be set to leave chatroom')
    var userId = param.userId = session.userId
      , chatId = param.chatId
    var chatroom = this.get(chatId)
    if (! chatroom) return cb('Chatroom> invalid chatId')
    else if (chatroom.members.indexOf(userId) === -1) return cb('Chatroom> member "'+userId+'" cannot leave: not in')
    return cb(null, chatroom && chatroom.members.indexOf(userId) !== -1)
  },
  o: function(t, param, cb) {
    var userId = param.userId
      , chatId = param.chatId
    try {
      var chatroom = this.get(chatId)
      chatroom.members = chatroom.members.filter(function(u) { return u !== userId})
      chatroom.messages.push('* Chatroom left by '+userId)
      this.update(chatId, chatroom, cb)
    } catch(e) {
      cb(e)
    }
  }
},{
  n: 'send',
  p: {
    chatId: 1,
    msg: 1
  },
  c: function(t, param, cb) {
    var session = this.get(asSession(param.sessid))
    if (! session) return cb('Session> session must be set to send message')
    var userId = param.userId = session.userId
      , chatId = param.chatId
    var chatroom = this.get(chatId)
    if (! chatroom) return cb('Chatroom> invalid chatId')
    else if (chatroom.members.indexOf(userId) === -1) return cb('Chatroom> member "'+userId+'" cannot send message: not in')
    return cb(null, chatroom && chatroom.members.indexOf(userId) !== -1)
  },
  o: function(t, param, cb) {
    var userId = param.userId
      , msg = param.msg
      , chatId = param.chatId
    try {
      var chatroom = this.get(chatId)
      chatroom.messages.push(userId + ': ' + msg)
      this.update(chatId, chatroom, cb)
    } catch(e) {
      cb(e)
    }
  }
}])
