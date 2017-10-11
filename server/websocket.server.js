const socketIO = require('socket.io');
const p2pSocketServer = require('socket.io-p2p-server').Server;

const wsService = function(server) {
  let msgSeq = 0;

  const wsServer = socketIO(server);
  wsServer.use(p2pSocketServer); //Attaching p2p server middleware

  wsServer.on('connection', function(clientSocket) {
    console.log('[*] Got new client socket connection ');

    // p2pSocketServer(clientSocket);

    clientSocket.on('event::onNewPEER', function(message) {
      console.log('[ ^ ] New PEER: ', message);
    });

    // PING is the event name
    clientSocket.on('event::PING', function(message) {
      console.log('[ <- ] Received: ', message);

      let now = new Date();
      let msg = {
        seq: ++msgSeq,
        ts: (now.toDateString() + ' ' + now.toTimeString()),
        message: ' Got ' + message
      };

      // PONG is the event name
      // console.log("[ -> ] Sending message ");
      // clientSocket.emit('PONG', JSON.stringify(msg));

      // Send to all connected WS clients
      console.log("[ => ] Broadcasting message ");
      // wsServer.emit('event::PONG', JSON.stringify(msg));
      clientSocket.broadcast.emit('event::PONG', JSON.stringify(msg));
    });

    // clientSocket.on('event::overToWebRTC', function(message) {
    clientSocket.on('go-private', function(message) {
      console.log("[ => ] Broadcasting to switch to WebRTC ");
      clientSocket.broadcast.emit('event::onToWebRTC', JSON.stringify(message));
    });

    clientSocket.on('disconnect', function() {
      console.log('[*] Client socket disconnected ...!');
    });

  });
}


module.exports = wsService;
