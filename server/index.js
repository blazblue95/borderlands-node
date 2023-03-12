const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = 5000;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

// Static files
app.use(express.static("public"));

// Socket setup
const io = require('socket.io')(server, {
  cors: {
      origin: "http://localhost:5000",
      methods: ["GET", "POST"],
      transports: ['websocket', 'polling'],
      credentials: true
  },
  allowEIO3: true
});

const activeUsers = new Set();
const rooms = io.of("/").adapter.rooms;

io.on("connection", function (socket) {
  console.log("Made socket connection");

  // create and join room
  socket.on("create", function (data) {
    console.log('data', data);
    socket.join(data?.roomID)
    activeUsers.add(data?.userName);
    io.emit("new user in room", [...activeUsers]);
    console.log('room created, rooms: ', rooms)
  });

  // connect to the room
  socket.on("join", function (data) {
    console.log('socket', socket.id)
    socket.userId = data.userID;
    console.log('data', data)

    // if roomID does not exist, emit wrong room back to client
    if (!rooms.get(data?.roomID)) {
      console.log('wrong roomID!')
      console.log('rooms', rooms)
      console.log('activUsers', activeUsers)
      io.to(socket.id).emit('wrong roomID!')
    } else {
      socket.join(data?.roomID)
      activeUsers.add(data);
      io.emit("new user", [...activeUsers]);
    }
  });

  // disconnect
  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
    console.log('user disconnected')
  });

  // message
  socket.on("chat message", function (data) {
    io.emit("chat message", data);
  });
  
  // typing
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });
});