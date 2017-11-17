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

exports = module.exports = []

function withPrefix(prefix) {
  return function(id) {
    return prefix+id
  }
}

const asSession = withPrefix('Sess: ')
const asUser = withPrefix('User: ')
const asChatroom = withPrefix('Chatroom: ')

exports.push({
  n: 'create_user',
  p: {
    userId: 1,
    pass: 1
  },
  c: function(t, param, cb) {
    var session = this.get(asSession(param.sessid))
    if (! session) return cb('Session> session must be set to create user')
    else if (session.userId !== 'root')  return cb('Session> session must be user admin to create user')
    var user = this.get(asUser(param.userId))
    if (user) return cb ('User> userId "'+param.userId+'" already exists')
    else return cb()
  },
  o: function(t, param, cb) {
    try {
      this.update(asUser(param.userId), { userId: param.userId, pass: param.pass }, cb)
    } catch(e) {
      cb(e)
    }
  }
},{
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
},{
  n: 'create_chatroom',
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
  n: 'join_chatroom',
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
  n: 'leave_chatroom',
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
  n: 'send_message',
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
})
