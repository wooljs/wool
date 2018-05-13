#!/usr/bin/env node
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

var meow = require('meow')
  , fs = require('fs')
  , cli = meow(`
Usages:

$ wool

  This documentation.

$ wool <rule file> [options]

  Launch wool webapp with a JS rule file (see Doc for format).

  Specific options
    -d, --debug       run the app in debug mode
    -p, --port        define the port for the app (default: 3000)
    -e, --event-in    an events file that is to be played on launching of the app
                      (see Doc for format) (default: ./event.db)
    -o, --event-out   an events file to store events (see Doc for format)
                      (default: same than --event-in)
    -i, --init-store  a JSON file containing an init store (optional)

  Examples
    $ wool rules.js -d -p 8080
    $ wool rules.js -s store.json -e store.evt
    $ wool rules.js -e init.evt`
  , {
    flags: {
      debug: {
        type: 'boolean',
        alias: 'd',
        default: false
      },
      port: {
        type: 'string',
        alias: 'p',
        default: '3000'
      },
      initStore: {
        type: 'string',
        alias: 'i',
        default: undefined
      },
      eventIn: {
        type: 'string',
        alias: 'e',
        default: 'event.db'
      },
      eventOut: {
        type: 'string',
        alias: 'o',
        default: undefined
      }
    }
  })
  , path = require('path')

if (cli.input.length===0) {
  cli.showHelp()
} else {
  //console.log(cli.input, cli.flags)
  let start = Date.now()
    , debug = cli.flags.debug
    , port = +cli.flags.port
    , eventDB = path.resolve(cli.flags.eventIn)

    , bunyan = require('bunyan')
    , logger = bunyan.createLogger({name: 'myapp'})

    , wool = require('./lib/wool.js')

    , { Store } = require('wool-store')
    , initStore = cli.flags.initStore ? path.resolve(cli.flags.initStore) : undefined
    , dataStore = Store.build()

    , rules = require(path.resolve(cli.input[0]))

  if (debug) logger.info('Debug mode activated')
  logger.info('Port %d', port)
  logger.info('Load events %s', eventDB)

  if (initStore) {
    logger.info('Load init store %s', initStore)
    var ini = JSON.parse(fs.readFileSync(initStore).toString())
    Object.keys(ini).forEach(function(k){ dataStore.set(k, ini[k]) })
    if (debug) logger.info(dataStore)
  }

  wool()
  .logger(logger)
  .store(dataStore)
  .rule(rules)
  .withFile(eventDB)
  .onReady(function(count) {
    logger.info('Load %d events in %dms', count, Date.now() - start)
    var server = require('./app/server')(logger, debug, port)
    require('./app/wss')(logger, server, this, rules, dataStore)
    logger.info('App ready in %dms', Date.now() - start)
  })
  .run()

}
