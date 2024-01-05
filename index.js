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
const fs = require("fs");

const port = 3002;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "ui/html/index.html"));
});

app.use(express.static("ui"));

// Load existing messages from the JSON file
let messages = JSON.parse(fs.readFileSync("messages.json", "utf8"));

io.on("connection", (socket) => {
  socket.broadcast.emit("user connect");

  // Send existing messages to the newly connected client
  socket.emit("load messages", messages);

  socket.on("disconnect", () => {
    io.emit("user disconnect");
  });

  socket.on("chat message", (msg) => {
    // Add the new message to the array
    messages.push(msg);
    // Broadcast the message to all clients
    io.emit("chat message", msg);
    // Save the updated messages array to the JSON file
    fs.writeFileSync("messages.json", JSON.stringify(messages), "utf8");
  });

  socket.on("typing", (nickname) => {
    socket.broadcast.emit("typing", nickname);
  });
});

http.listen(port, '0.0.0.0', () => {
  console.log(`Server started on http://0.0.0.0:${port}`);
});