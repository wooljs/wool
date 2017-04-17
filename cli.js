/*
 * Copyright 2014 Nicolas Lochet Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is
 * distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

var meow = require('meow')
  , cli = meow(
    '\n  Usages\n'+
    '    $ wool\n'+
    '\n'+
    '      This documentation.\n'+
    '\n'+
    '    $ wool <rule file> [options]\n'+
    '\n'+
    '      Launch wool webapp with a JS rule file (see Doc for format).\n'+
    '      Specific options\n'+
    '        -s, --state\ta JSON file containing an init state\n'+
    '        -e, --event\tan events file that is to be played on launching of the app (see Doc for format)\n'+
    '        -o, --out\tan events file to store events (see Doc for format)\n'+
    '\n'+
    '      Examples\n'+
    '        $ wool rules.js -s state.json\n'+
    '        $ wool rules.js -s state.json -o store.evt\n'+
    '        $ wool rules.js -e init.evt\n',
    {
      alias: {
//        c: 'command', ??
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
    , bunyan = require('bunyan')
    , logger = bunyan.createLogger({name: 'myapp'})

    , server = require('./app/server')(logger, 3000)
    , wss = require('./app/wss')(logger, server)
    
    , wool = require('./lib/wool.js')


  logger.info('Start in %dms', Date.now() - start)
}






