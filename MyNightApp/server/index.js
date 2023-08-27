const express = require("express");
const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//👇🏻 New imports
const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());

//
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "https://f6c5-192-80-65-177.ngrok-free.app",
  },
});

//👇🏻 Add this before the app.get() block
socketIO.on("connection", (socket) => {
  socket.on("buttonMessage", (arg) => {
    console.log(`user ${arg} has entered the room!`);
    socket.emit("serverEnterRoom", `user ${arg} has entered the room!`);
  });
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on("message", (arg) => {
    socket.emit("server send", "this is sent from server");
  });

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });
});

//
app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
