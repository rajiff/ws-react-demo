const WebSocket = require('ws');

const wsService = function(server) {
  let msgSeq = 0;
  const wsServer = new WebSocket.Server({
    server
  });

  wsServer.on('connection', function connection(clientSocket) {
    console.log('Got new socket connection from client ');

    clientSocket.on('message', function incoming(message) {
      console.log('received: %s', message);

      let now = new Date();
      clientSocket.send(JSON.stringify({
        seq: ++msgSeq,
        ts: (now.toDateString() + ' ' + now.toTimeString()),
        message: ' Got ' + message
      }));
    });
  });

}


module.exports = wsService;
