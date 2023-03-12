/* eslint-disable no-param-reassign */
const express = require('express');

// App setup
const PORT = 5000;
const app = express();
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

// Static files
app.use(express.static('public'));

// Socket setup
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:5000',
    methods: ['GET', 'POST'],
    transports: ['websocket', 'polling'],
    credentials: true,
  },
  allowEIO3: true,
});

const activeUsers = new Set();
const { rooms } = io.of('/').adapter;
const clients = io.sockets.adapter.rooms;

const fetchSockets = async (roomID) => {
  const sockets = await io.in(roomID).fetchSockets();
  // console.log('sockets', sockets.length);
  console.log('sockets', sockets);
  sockets.forEach((sock) => console.log('userID', sock.userId));
  return sockets;
};

io.on('connection', (socket) => {
  console.log('Made socket connection');

  // create and join room
  socket.on('create', (data) => {
    console.log('data', data);
    socket.join(data?.roomID);
    socket.userId = data.userId;
    activeUsers.add(data?.userId);
    io.emit('new user', [...activeUsers]);
    console.log('activeUsers', activeUsers);
    console.log('room created, rooms: ', rooms);
  });

  // connect to the room
  socket.on('join', (data) => {
    console.log('socket', socket.id);
    socket.userId = data.userId;
    const { roomID } = data;
    console.log('data', data);

    // if roomID does not exist, emit wrong room back to client
    if (!rooms.get(roomID)) {
      console.log('wrong roomID!');
      console.log('rooms', rooms);
      console.log('activUsers', activeUsers);
      io.to(socket.id).emit('wrong roomID!');
    } else {
      socket.join(roomID);
      activeUsers.add(data.userID);
      io.emit('new user', [...activeUsers]);
      console.log('activeUsers', activeUsers);
      console.log('room clients', clients.get(roomID));
      fetchSockets(roomID);
    }
  });

  // disconnect
  socket.on('disconnect', () => {
    activeUsers.delete(socket.userId);
    io.emit('user disconnected', socket.userId);
    console.log('user disconnected');
  });

  // message
  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });

  // typing
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });
});
