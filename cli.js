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
      -d, --debug\trun the app in debug mode
      -p, --port\tdefine the port for the app (default: 3000) 
      -s, --state\ta JSON file containing an init state
      -e, --event\tan events file that is to be played on launching of the app (see Doc for format)
      -o, --out\tan events file to store events (see Doc for format)

    Examples
      $ wool rules.js -s state.json
      $ wool rules.js -s state.json -o store.evt
      $ wool rules.js -e init.evt`,
    {
      alias: {
//        c: 'command', ??
        d: 'debug',
        p: 'port',
        s: 'state',
        e: 'event',
        o: 'out'
      }
    }
  )
if (cli.input.length===0) {
  cli.showHelp()
} else {
  console.log(cli.input)
  console.log(cli.flags)

  var start = Date.now()
    , debug = 'debug' in cli.flags
    , port = 'port' in cli.flags ? +cli.flags.port : 3000

    , bunyan = require('bunyan')
    , logger = bunyan.createLogger({name: 'myapp'})

    , wool = require('./lib/wool.js')
    , Store = require('wool-store')
    , dataStore = Store()
    , rules = require(__dirname+'/'+cli.input[0])
    , eventDB = __dirname + '/data/events.db'
    
  wool()
  .store(dataStore)
  .rule(rules)
  .withFile(eventDB)
  .onReady(function() {
    var server = require('./app/server')(logger, debug, port)
    require('./app/wss')(logger, server, this, rules, dataStore)
    logger.info('Start in %dms', Date.now() - start)
  })
  .run()

}






