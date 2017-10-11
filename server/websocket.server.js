const socketIO = require('socket.io');
const p2pSocketServer = require('socket.io-p2p-server').Server;

const wsService = function(server) {
  const wsServer = socketIO(server);
  wsServer.use(p2pSocketServer); //Attaching p2p server middleware

  wsServer.on('connection', function(clientSocket) {
    console.log('[*] Got new client socket connection ');

    clientSocket.on('peer-msg', function(data) {
      console.log('Message from peer: %s', data)
      clientSocket.broadcast.emit('peer-msg', data)
    })

    clientSocket.on('peer-file', function(data) {
      console.log('File from peer: %s', data)
      clientSocket.broadcast.emit('peer-file', data)
    })

    clientSocket.on('go-private', function(data) {
      clientSocket.broadcast.emit('go-private', data)
    })

    clientSocket.on('disconnect', function() {
      console.log('[*] Client socket disconnected ...!');
    });

  });
}


module.exports = wsService;