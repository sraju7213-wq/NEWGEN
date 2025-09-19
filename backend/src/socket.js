const { logActivity } = require('./utils/activityLogger');

function setupSocket(server) {
  const { Server } = require('socket.io');
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN?.split(',') || '*',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId;
    const promptId = socket.handshake.query?.promptId;

    if (promptId) {
      socket.join(`prompt:${promptId}`);
    }

    socket.on('prompt:edit', (data) => {
      if (!data?.promptId) return;
      socket.to(`prompt:${data.promptId}`).emit('prompt:edit', data);
      if (userId) {
        logActivity(userId, 'collaboration.edit', { promptId: data.promptId });
      }
    });

    socket.on('prompt:cursor', (data) => {
      if (!data?.promptId) return;
      socket.to(`prompt:${data.promptId}`).emit('prompt:cursor', { ...data, userId });
    });

    socket.on('chat:message', (message) => {
      if (!promptId) return;
      io.to(`prompt:${promptId}`).emit('chat:message', { ...message, userId, timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', () => {
      if (promptId) {
        socket.leave(`prompt:${promptId}`);
      }
    });
  });

  return io;
}

module.exports = setupSocket;
