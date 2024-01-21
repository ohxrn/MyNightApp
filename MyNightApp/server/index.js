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
    origin: "https://f71e-2601-19b-280-4960-11ce-5c99-18f0-73f7.ngrok-free.app",
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
    newDataArray = {
      text: data.text,
      room: data.room,
      ID: data.ID,
      images: data.images[0],
    };
    console.log(
      "Here is what is sent to server for the group--------------------------------------",
      newDataArray
    );
    if (data.room == "undefined") {
      console.log("NOBODY IS HERE");
    } else {
      socket.broadcast.emit("roomTextFromServer", newDataArray);
    }
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
