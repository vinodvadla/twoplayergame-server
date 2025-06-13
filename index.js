const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Enable CORS
const io = new Server(server, {
  cors: {
    origin: 'https://twoplayergame-client.vercel.app',
    methods: ['GET', 'POST'],
  },
});

let players = [];
let currentBoard = Array(9).fill(null);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  if (players.length < 2) {
    players.push(socket);
    const playerNumber = players.length;
    socket.emit('playerAssigned', playerNumber);
  } else {
    socket.emit('playerAssigned', null); // game full
  }

  socket.on('makeMove', ({ index, symbol }) => {
    currentBoard[index] = symbol;
    // Broadcast move to all except the sender
    socket.broadcast.emit('moveMade', { index, symbol });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    players = players.filter((p) => p !== socket);
    currentBoard = Array(9).fill(null);
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
