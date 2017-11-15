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

module.exports = (function() {
  'use strict'
  var stream = require('stream')
    , util = require('util')
    , Rule = require('wool-rule')

  function RuleDispatch(rule, onError) {
    if (! (rule instanceof Rule)) throw new Error('rule must be of class Rule')
    if (!(this instanceof RuleDispatch)) return new RuleDispatch(rule)
    this.rule = rule
    this.onError = typeof onError === 'function' ? onError : function(){} 
    stream.Transform.call(this, {objectMode: true})
  }
  util.inherits(RuleDispatch, stream.Transform)
  RuleDispatch.prototype._transform = function (data, encoding, callback) {
    try {
      this.rule.push(data, function(err) {
        if (err) {
          if (typeof err === 'string') data.setStatus('I', err.replace('\n', '\\n'))
//          else if (err instanceof Error) data.setStatus('E', err.stack ? err.stack : err.toString().replace('\n', '\\n'))
          else return callback(err)
          this.onError(data)
        }
        this.push(data)
        return callback()
      }.bind(this))
    } catch(e) {
      return callback(e)
    }
  }
  return RuleDispatch
}())
