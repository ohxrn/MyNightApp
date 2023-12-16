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
    origin: "https://f410-2601-19b-280-4960-bc6a-9e0b-d312-1217.ngrok-free.app",
  },
});

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("buttonMessage", (arg) => {
    console.log("THIS IS THE MESSAGE", arg);
    console.log(`user ${arg} has entered the room!`);
    socket.emit("serverEnterRoom", `user ${arg} has entered the room!`);
  });

  // Move the "groupName" event listener outside the "buttonMessage" event listener
  // socket.on("groupName", (data) => {
  //   console.log("this is what server receives", data);
  //   socket.emit("groupNameEnd", data);
  // });
  socket.on("joinRoom", (context) => {
    console.log("this is what triggers on the enter", context);
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
