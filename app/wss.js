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

module.exports = function (logger, server, wool, rules, dataStore) {
  'use strict'

  var WebSocketServer = require('websocket').server
    , wss = new WebSocketServer({ httpServer: server })
    , Event = require('wool-stream').Event
    , session = require('./session')(dataStore)

  function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    logger.info('Origin: %s', origin)
    return true;
  }
  
  function sendOnConnection(connection, sessid, m) {
    var out = JSON.stringify(m)
    logger.info('Send to '+sessid+' Message: \'' + out + '\'')
    connection.sendUTF(out)
  }

  wss.on('request', function(request) {
      
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin 
      request.reject()
      logger.info('Connection from origin %s rejected.', request.origin)
      return
    }
    
    var connection = request.accept('echo-protocol', request.origin)
      , sessid = session.getId()
    logger.info('Connection accepted for sessid: '+sessid)
    
    dataStore.subAll(sessid, function(id, v, t) {
      switch(t) {
        case 'update':
          return sendOnConnection(connection, sessid, { t: 'set', d : { k : id, v:  v }})
        case 'delete':
          return sendOnConnection(connection, sessid, { t: 'del', d : { k : id }})
      }
    })
    
    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        logger.info('Received from '+sessid+' Message: \'' + message.utf8Data + '\'')
        var m = JSON.parse(message.utf8Data)
          , r = {}
        if ('t' in m) {
          switch(m.t) {
            case 'init':{
              r.t ='init'
              r.d = {
                command: {
                  list: rules
                },
                data: Object.keys(dataStore._).reduce(function(p, k) {
                  p[k] = dataStore._[k].v
                  return p
                }, {})
              }
              sendOnConnection(connection, sessid, r)
            }
            break;
            case 'command': {
              m.d.sessid = sessid
              wool.push(Event(new Date(), 0, m.n, m.d))
            }
            break;
            default: {
              sendOnConnection(connection, sessid, { err: 'unknown "t" field: "'+m.t+'"' })
            }
          }
        } else {
          sendOnConnection(connection, sessid, { err: 'message must have a "t" field' })
        }
      }
      else if (message.type === 'binary') {
        logger.info('Received Binary Message of %s bytes.', message.binaryData.length)
        //connection.sendBytes(message.binaryData)
      }
    })
    connection.on('close', function(reasonCode, description) {
      logger.info(' Peer %s, sessid: %s, disconnected.', connection.remoteAddress, sessid);
      dataStore.unsubAll(sessid)
    })
  })

  return wss
}
