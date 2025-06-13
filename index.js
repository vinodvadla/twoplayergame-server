const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let players = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle new player
  socket.on('joinGame', () => {
    if (Object.keys(players).length < 2) {
      players[socket.id] = { id: socket.id };
      socket.emit('playerAssigned', Object.keys(players).length);
      io.emit('playersUpdate', players);
    } else {
      socket.emit('roomFull');
    }
  });

  // Handle game move
  socket.on('makeMove', (data) => {
    socket.broadcast.emit('moveMade', data);
  });


  
  // Handle disconnect
  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playersUpdate', players);
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
