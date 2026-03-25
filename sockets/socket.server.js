const { Server } = require("socket.io");
const alertService = require("../services/alert.service")

let io

exports.initSocket = (server) => {

  io = new Server(server, {
    cors: { origin: "*" }
  })

  io.on("connection", (socket) => {

    socket.on("register", (userId) => {
      socket.join(userId);
    });

  });

  alertService.initSocket(io)

  return io
};

