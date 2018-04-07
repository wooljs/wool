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
    , { Command } = require('wool-model')
    , { Store } = require('wool-store')

  function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    logger.info('Origin: %s', origin)
    return true
  }

  function sendOnConnection(connection, connid, m) {
    var out = JSON.stringify(m)
    logger.info('Send to '+connid+' Message: \'' + out + '\'')
    connection.sendUTF(out)
  }

  wss.on('request', function(request) {

    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject()
      logger.info('Connection from origin %s rejected.', request.origin)
      return
    }

    let connection = request.accept('echo-protocol', request.origin)
      , connid = Store.newId()
    logger.info('Connection accepted for connid: '+connid)

    dataStore.subAll(connid, function(id, v, t) {
      switch(t) {
      case 'update':
        return sendOnConnection(connection, connid, { t: 'set', d : { k : id, v:  v }})
      case 'delete':
        return sendOnConnection(connection, connid, { t: 'del', d : { k : id }})
      }
    })

    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        logger.info('Received from '+connid+' Message: \'' + message.utf8Data + '\'')
        var m = JSON.parse(message.utf8Data)
          , r = {}
        if ('t' in m) {
          switch(m.t) {
          case 'init':{
            r.t ='init'
            let data = {}
            dataStore.db.forEach((v, k) => {
              data[k] = v.get()
            })
            r.d = {
              connid,
              data,
              command: {
                list: rules.map(x => x.toDTO() )
              },
            }
            sendOnConnection(connection, connid, r)
          }
            break
          case 'command': {
            m.d.connid = connid
            wool.push(new Command(new Date(), 0, m.n, m.d))
          }
            break
          default: {
            sendOnConnection(connection, connid, { err: 'unknown "t" field: "'+m.t+'"' })
          }
          }
        } else {
          sendOnConnection(connection, connid, { err: 'message must have a "t" field' })
        }
      }
      else if (message.type === 'binary') {
        logger.info('Received Binary Message of %s bytes.', message.binaryData.length)
        //connection.sendBytes(message.binaryData)
      }
    })
    connection.on('close', function(reasonCode, description) {
      logger.info(' Peer %s, connid: %s, disconnected.', connection.remoteAddress, connid)
      dataStore.unsubAll(connid)
    })
  })

  return wss
}
