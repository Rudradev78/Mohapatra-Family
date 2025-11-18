import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store connected users
let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // user joins meet with name
  socket.on("join-meet", (name) => {
    users[socket.id] = { name };
    io.emit("users-update", users);
  });

  // mic toggle
  socket.on("toggle-mic", (status) => {
    io.emit("mic-updated", { id: socket.id, status });
  });

  // video toggle
  socket.on("toggle-video", (status) => {
    io.emit("video-updated", { id: socket.id, status });
  });

  // WebRTC signals
  socket.on("offer", (data) => {
    socket.to(data.to).emit("offer", { offer: data.offer, from: socket.id });
  });

  socket.on("answer", (data) => {
    socket.to(data.to).emit("answer", { answer: data.answer, from: socket.id });
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.to).emit("ice-candidate", { candidate: data.candidate, from: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete users[socket.id];
    io.emit("users-update", users);
  });
});

// base route
app.get("/", (req, res) => {
  res.send("Family Video Call Backend is Running");
});

// PORT for Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
