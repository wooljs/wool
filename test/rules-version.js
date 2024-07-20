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
import { Rule } from 'wool-rule'
import { InvalidRuleError, Num, Tuple } from 'wool-validate'
const VerNum = Tuple('version', [Num().asInt(), Num().asInt(), Num().asInt()])
const K = 'Version'
const logger = /**/ { log () { } } //* / console

export default Rule.buildSet('version', {
  name: 'init',
  param: [VerNum],
  async cond (store) {
    if (await store.has(K)) throw new InvalidRuleError('version already exists')
  },
  async run (store, param, t) {
    logger.log('version:init')
    const { version } = param
    await store.set(K, { id: K, t, version })
  }
}, {
  name: 'patch',
  async cond (store) {
    if (!await store.has(K)) throw new InvalidRuleError('version should exists')
  },
  async run (store, param, t) {
    logger.log('version:patch')
    const ver = await store.get(K)
    ver.t = t
    ver.version[2]++
    await store.set(K, ver)
  }
}, {
  name: 'minor',
  async cond (store) {
    if (!await store.has(K)) throw new InvalidRuleError('version should exists')
  },
  async run (store, param, t) {
    logger.log('version:minor')
    const ver = await store.get(K)
    ver.t = t
    ver.version[2] = 0
    ver.version[1]++
    await store.set(K, ver)
  }
}, {
  name: 'major',
  async cond (store) {
    if (!await store.has(K)) throw new InvalidRuleError('version should exists')
  },
  async run (store, param, t) {
    logger.log('version:major')
    const ver = await store.get(K)
    ver.t = t
    ver.version[2] = 0
    ver.version[1] = 0
    ver.version[0]++
    await store.set(K, ver)
  }
}, {
  name: 'set',
  param: [VerNum],
  async cond (store) {
    if (!await store.has(K)) throw new InvalidRuleError('version should exists')
  },
  async run (store, param, t) {
    logger.log('version:set')
    const { version } = param
    await store.set(K, { id: K, t, version })
  }
})
