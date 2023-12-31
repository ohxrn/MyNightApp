const express = require("express");
const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "https://44ce-2601-19b-280-4960-b407-85d1-fc50-fcaf.ngrok-free.app",
  },
});
const connectedClients = {};
socketIO.on("connection", (socket) => {
  // console.log(`⚡: ${socket.id} user just connected!`);
  connectedClients[socket.id] = { geek: "geek" };
  const numberOfConnections = Object.keys(connectedClients).length;
  console.log(`[[Number of connections: ${numberOfConnections}]]`);

  socket.on("buttonMessage", (arg) => {
    console.log(`user ${arg} has entered the room!`);
    socket.emit("serverEnterRoom", `user ${arg} has entered the room!`);
  });

  socket.on("sendGroupToServer", (data) => {
    console.log(
      "Here is what is sent to server for the group--------------------------------------",
      data
    );
    socket.emit("roomTextFromServer", data);
  });

  socket.on("joinRoom", (context) => {
    // console.log("User will join this room:", context);
    socket.broadcast.emit("groupSituation", context);
    // console.log("event was thrown from server");
  });
  socket.on("message", (arg) => {
    socket.emit("server send", "this is sent from the server");
  });

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
