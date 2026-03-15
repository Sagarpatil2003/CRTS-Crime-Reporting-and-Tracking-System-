const express = require('express');
const http = require('http'); // 1. Need this to create the server
const { Server } = require("socket.io");
const dotenv = require('dotenv');
const morgan = require('morgan');

const socketManager = require("./sockets/notification.socket");
const connectDB = require('./config/db.config');
const authRouter = require('./routes/auth.route');
const caseRouter = require('./routes/case.routes');
const globalErrorHandler = require('./middlewares/globalErrorHandler.middleware');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app); // 2. Create the HTTP server using the app

// 3. Initialize Socket.io with THIS server instance
const io = new Server(server, { 
  cors: { origin: "*" } 
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/auth', authRouter);
app.use('/case', caseRouter);

// Initialize your custom socket logic
socketManager.init(io);

// Error Handlers
app.use(globalErrorHandler);
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// 4. CRITICAL: Use server.listen, NOT app.listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('Server running on port ' + PORT));

module.exports = app;
