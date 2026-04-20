require('dotenv').config();
const http   = require('http');
const { Server } = require('socket.io');
const app    = require('./src/app');

const PORT   = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

app.set('io', io);
app.set('onlineUsers', onlineUsers);

server.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
}); 