const socketIO = require('socket.io');

const wsService = function(server) {
  let msgSeq = 0;

  const wsServer = socketIO(server);

  wsServer.on('connection', function(clientSocket) {
    console.log('[*] Got new client socket connection ');

    // PING is the event name
    clientSocket.on('PING', function(message) {
      console.log('received: %s', message);

      let now = new Date();
      let msg = {
        seq: ++msgSeq,
        ts: (now.toDateString() + ' ' + now.toTimeString()),
        message: ' Got ' + message
      };

      // PONG is the event name
      clientSocket.emit('PONG', JSON.stringify(msg));
    });

    clientSocket.on('disconnect', function() {
      console.log('[*] Client socket disconnected ...!');
    });
  });
}


module.exports = wsService;
