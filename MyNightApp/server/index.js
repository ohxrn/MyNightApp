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
    origin: "https://e747755d2664.ngrok.app",
  },
});
//-----------------------------------------------------------
const connectedClients = {};
socketIO.on("connection", (socket) => {
  // console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("buttonMessage", (arg) => {
    console.log(`user ${arg} has entered the room!`);
    socket.emit("serverEnterRoom", `user ${arg} has entered the room!`);
  });

  socket.on("sendGroupToServer", (data) => {
    console.log(data);
    if (data.images.length == 0) {
      console.log("NO IMAGE HERE");
    }
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
