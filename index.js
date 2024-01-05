const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3002",  // or your client's origin
    methods: ["GET", "POST"],
  },
});

const port = 3002;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "ui/html/index.html"));
});

app.use(express.static("ui"));

io.on("connection", (socket) => {
  socket.broadcast.emit("user connect");

  socket.on("disconnect", () => {
    io.emit("user disconnect");
  });

  socket.on("chat message", (msg) => {
    socket.broadcast.emit("chat message", msg);
  });

  socket.on("typing", (nickname) => {
    socket.broadcast.emit("typing", nickname);
  });
});

http.listen(port, '0.0.0.0', () => {
  console.log(`Server started on http://0.0.0.0:${port}`);
});