const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8000",
    methods: ["GET", "POST"],
  },
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Track rooms and users
const rooms = {}; // Keeps track of which user is in which room

io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for user joining a room
  socket.on("join_room", (user_id) => {
    // Check if the room already exists
    if (!rooms[user_id]) {
      rooms[userId] = [];
    }

    // Add the socket ID to the user's room
    rooms[user_id].push(socket.id);
    socket.join(user_id); // Join the socket to the room
    console.log(`User ${user_id} joined the room`);

    // Notify the user they have joined the room (optional)
    socket.emit("joined_room", `You joined room: ${user_id}`);
  });

  // Listen for messages from the admin
  socket.on("send_message", (message) => {
    console.log("Received message:", message);

    // Send the message to the specific room (current room the user is in)
    if (rooms[message.room]) {
      // Only emit the message to users in the current room
      io.to(message.room).emit("new_message", message);
      console.log(`Message sent to room: ${message.room}`);
    } else {
      console.log(`Room ${message.room} not found`);
    }
  });

  // Disconnect the user
  socket.on("disconnect", () => {
    console.log("A user disconnected");

    // Remove the socket from the rooms when the user disconnects
    for (let userId in rooms) {
      rooms[userId] = rooms[userId].filter(socketId => socketId !== socket.id);
      
      // If no sockets remain in the room, remove the room
      if (rooms[userId].length === 0) {
        delete rooms[userId];
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
