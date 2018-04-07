/*
 * Copyright 2018 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

const { RuleParam } = require('wool-rule')
  , crypto = require('crypto')

exports = module.exports = {}

const sessionIdAlgo = async () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(24, (err, buf) => {
      if (err) return reject(err)
      resolve(buf.toString('base64'))
    })
  })
}

exports.SessionID = RuleParam.ID('sessid', {prefix: 'Session: ', algo: sessionIdAlgo})
exports.UserID = RuleParam.ID('userId', {prefix: 'User: '})
exports.ChatID = RuleParam.ID('chatId', {prefix: 'Chat: '})
exports.Login = RuleParam.STR('login').regex(/^\w{3,}$/)

exports.hash = (value) => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(24, (err, buf) => {
      let salt = buf.toString('base64')
        , tobehashed = Buffer.from(value).toString('base64')
      crypto.pbkdf2(salt+tobehashed, salt, 100000, 96, 'sha512', (err, derivedKey) => {
        if (err) return reject(err)
        resolve(salt+derivedKey.toString('base64'))
      })
    })
  })
}

exports.match = (hash, value) => {
  return new Promise((resolve, reject) => {
    let buf = Buffer.from(hash)
      , salt = buf.toString('utf8', 0, 32)
      , pass = buf.toString('utf8', 32)
      , tobehashed = Buffer.from(value).toString('base64')
    crypto.pbkdf2(salt+tobehashed, salt, 100000, 96, 'sha512', (err, derivedKey) => {
      if (err) return reject(err)
      let tmp = derivedKey.toString('base64')
      resolve(pass === tmp)
    })
  })
}

exports.Passwd = RuleParam.STR('password').regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[\.:;,?!@#$%^&*+_\\/'"{}()\[\] -])[A-Za-z\d\.:;,?!@#$%^&*+_\\/'"{}()\[\] -]{8,}$/)

exports.EncryptedPassword = exports.Passwd.crypto({ hash: exports.hash, match: exports.match })

exports.Msg = RuleParam.STR('msg')

exports.AuthIndex = "AuthIndex"
