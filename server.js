require('dotenv').config()
const express = require('express');
const http = require('http'); // 1. Need this to create the server
const morgan = require('morgan');


const connectDB = require('./config/db.config');
const connectRedis = require('./config/redis.config')
const globalErrorHandler = require('./middlewares/globalErrorHandler.middleware');
const authRouter = require('./routes/auth.route');
const caseRouter = require('./routes/case.routes');
const evidenceRouter = require('./routes/evidence.route')
const mapRouter = require('./routes/map.routes')
const officerRouter = require("./routes/officer.routes")
const adminRouter = require("./routes/admin.route")
const { initSocket } = require("./sockets/socket.server")


require('./workers/alertWorker')
require('./workers/case.worker')
require('./workers/cron.worker')

const app = express()
const server = http.createServer(app)

const io = initSocket(server)
connectDB()



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/auth', authRouter)
app.use('/case', caseRouter)
app.use('/evidence', evidenceRouter)
app.use('/map',mapRouter)
app.use('/officer', officerRouter)
app.use('/admin', adminRouter)




app.use(globalErrorHandler);
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// 4. CRITICAL: Use server.listen, NOT app.listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('Server running on port ' + PORT));

module.exports = app;
