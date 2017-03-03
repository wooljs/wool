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

var options = {
    PORT: 3000
  }
  , start = Date.now()

  , bankai = require('bankai')
  , http = require('http')
  , path = require('path')

  , clientPath = path.join(__dirname, 'client.js')
  , assets = bankai(clientPath)

  , fs = require('fs')

  , fav = path.join(__dirname, 'favicon.ico')
  , favicon = fs.readFileSync(fav)

  , bunyan = require('bunyan')
  , logger = bunyan.createLogger({name: 'myapp'})
  
  , extract = function(t,a) {
    return a.reduce(function(p,c){ if (c in t && t[c]) p[c] = t[c]; return p },{})
  }
  , makeHttpLog = function(req, res, start) {
    return function() {
      var q = {
        req: extract(req, ['httpVersion', 'method', 'url', 'headers', 'body', 'remoteAddress']),
        res: extract(res, ['statusCode', '_header', '_headers'])
      }
      logger.info(q, '%s %s - %s in %dms', req.method, req.url, res.statusCode, Date.now() - start)
    }
  }

var server = http.createServer(function (req, res) {
  var log = makeHttpLog(req, res, Date.now())
  
  switch (req.url) {
    case '/': return assets.html(req, res).pipe(res).on('finish', log)
    case '/bundle.js': return assets.js(req, res).pipe(res).on('finish', log)
    case '/bundle.css': return assets.css(req, res).pipe(res).on('finish', log)
    case '/favicon.ico':  return res.writeHead(200,{'Content-Type': 'image/x-icon'}) && res.end(favicon, log)
    default: return (res.statusCode = 404) && res.end('404 not found', log)
  }

}).listen(options.PORT)

var WebSocketServer = require('websocket').server
  , wss = new WebSocketServer({ httpServer: server })

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  logger.info(origin)
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
      logger.info('Received Message: ' + message.utf8Data)
      connection.sendUTF(message.utf8Data)
    }
    else if (message.type === 'binary') {
      logger.info('Received Binary Message of %s bytes.', message.binaryData.length)
      connection.sendBytes(message.binaryData)
    }
  })
  connection.on('close', function(reasonCode, description) {
    logger.info(' Peer %s disconnected.', connection.remoteAddress);
  })
})

logger.info('Start in %dms', Date.now() - start)

