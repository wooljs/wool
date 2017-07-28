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

module.exports = function (logger, server, wool, rules, dataStore) {
  'use strict'

  var WebSocketServer = require('websocket').server
    , wss = new WebSocketServer({ httpServer: server })

  function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    logger.info('Origin: %s', origin)
    return true;
  }

  wss.on('request', function(request) {
      
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin 
      request.reject()
      logger.info('Connection from origin %s rejected.', request.origin)
      return
    }
    
    var connection = request.accept('echo-protocol', request.origin)
    logger.info('Connection accepted.')
    
    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        logger.info('Received Message: ' + JSON.stringify(message.utf8Data))
        var m = JSON.parse(message.utf8Data)
          , r = {}
        if ('t' in m) {
          switch(m.t) {
            case 'init':{
              r.t ='init'
              r.d = {
                command: {
                  list: rules
                }
              }
            }
            break;
            default: {
              r.err='unknown "t" field: "'+m.t+'"'
            }
          }
        } else {
          r.err='message must have a "t" field'
        }
        connection.sendUTF(JSON.stringify(r))
      }
      else if (message.type === 'binary') {
        logger.info('Received Binary Message of %s bytes.', message.binaryData.length)
        //connection.sendBytes(message.binaryData)
      }
    })
    connection.on('close', function(reasonCode, description) {
      logger.info(' Peer %s disconnected.', connection.remoteAddress);
    })
  })

  return wss
}
