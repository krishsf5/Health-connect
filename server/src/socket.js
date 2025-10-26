const { Server } = require('socket.io');

function initSocket(httpServer, corsOrigin) {
  const io = new Server(httpServer, {
    cors: { origin: corsOrigin, methods: ['GET', 'POST', 'PATCH'] }
  });

  io.on('connection', (socket) => {
    // client should emit 'join' with { userId, role }
    socket.on('join', ({ userId, role }) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      if (role === 'doctor') socket.join(`doctors:${userId}`);
      if (role === 'patient') socket.join(`patients:${userId}`);
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

module.exports = initSocket;
