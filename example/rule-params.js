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
exports = module.exports = {}

exports.SessionID = RuleParam.ID('sessId', {prefix: 'Sess'})
exports.UserID = RuleParam.ID('userId', {prefix: 'User'})
exports.ChatID = RuleParam.ID('chatId', {prefix: 'Chat'})
exports.Login = RuleParam.STR('login').regex(/^\w{3,}$/)

function algo(value) {
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

exports.Passwd = RuleParam.STR('passwd').regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[\.:;,?!@#$%^&*+_\\/'"{}()\[\] -])[A-Za-z\d\.:;,?!@#$%^&*+_\\/'"{}()\[\] -]{8,}$/).crypto(algo)

exports.Msg = RuleParam.STR('msg')

exports.AuthIndex = "AuthIndex"
