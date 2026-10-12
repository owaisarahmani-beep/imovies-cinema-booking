// Real-time seat tracking socket handler
const initSeatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join show room for live seat status updates
    socket.on('join_show', (showId) => {
      socket.join(showId.toString());
      console.log(`[Socket.io] Socket ${socket.id} joined show room: ${showId}`);
    });

    // Leave show room
    socket.on('leave_show', (showId) => {
      socket.leave(showId.toString());
      console.log(`[Socket.io] Socket ${socket.id} left show room: ${showId}`);
    });

    // Real-time seat lock notification across all watchers
    socket.on('seat_selecting', ({ showId, seatNumber, userId }) => {
      socket.to(showId.toString()).emit('seat_busy', {
        seatNumber,
        userId
      });
    });

    // Client disconnection
    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSeatSocket;
