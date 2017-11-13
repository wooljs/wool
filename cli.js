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
    alias: {
      d: 'debug',
      p: 'port',
      e: 'event-in',
      o: 'event-out',
      i: 'init-store'
    }
  })
  , path = require('path')

if (cli.input.length===0) {
  cli.showHelp()
} else {
  var start = Date.now()
    , debug = 'debug' in cli.flags
    , port = 'port' in cli.flags ? +cli.flags.port : 3000
    , eventDB = path.resolve('eventIn' in cli.flags ? cli.flags.eventIn : 'event.db')

    , bunyan = require('bunyan')
    , logger = bunyan.createLogger({name: 'myapp'})

    , wool = require('./lib/wool.js')
    , Store = require('wool-store')
    , dataStore = Store()
    , rules = require(__dirname+'/'+cli.input[0])

  if (debug) logger.info('Debug mode activated')
  logger.info('Port %d', port)
  logger.info('Load events %s', eventDB)

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
