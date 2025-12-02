const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const notesRoutes = require('./routes/notes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT']
  }
});

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://namohnj_db_user:o1D3zeVfyshGjTbX@collaborative-notes.99t3c9z.mongodb.net/?appName=Collaborative-notes')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/notes', notesRoutes);

// Helper to emit active users for a room
const emitActiveUsers = (noteId) => {
  const room = io.sockets.adapter.rooms.get(noteId);
  const activeUsers = room ? room.size : 0;
  io.to(noteId).emit('active_users', activeUsers);
};

// Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected');

  let currentRoom = null;

  socket.on('join_note', (noteId) => {
    // Leave previous room if any
    if (currentRoom) {
      socket.leave(currentRoom);
      emitActiveUsers(currentRoom);
    }

    socket.join(noteId);
    currentRoom = noteId;

    // Emit active users count for the joined room
    emitActiveUsers(noteId);
  });

  socket.on('note_update', (data) => {
    const { noteId, content } = data;
    socket.to(noteId).emit('note_update', content);
    // Auto-save to DB is handled on the client side
  });

  socket.on('disconnecting', () => {
    // For each room this socket was in, update active users
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        // Defer so that the socket is removed from the room first
        setTimeout(() => emitActiveUsers(roomId), 0);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
