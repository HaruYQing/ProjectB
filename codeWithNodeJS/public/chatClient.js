const socket = io();

// Message from server
socket.on("user connected", (msg) => {
  console.log(msg);
});

socket.on("chat message", (msg) => {
  console.log(msg);
});
