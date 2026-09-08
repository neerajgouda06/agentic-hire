const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/auth.routes');
const jobRoutes = require('./src/routes/job.routes');
const candidateRoutes = require('./src/routes/candidate.routes');
const workflowRoutes = require('./src/routes/workflow.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');
const http = require('http');
const socket = require('./src/utils/socket');

const app = express();
const server = http.createServer(app);

// Connection for MongoDB
connectDB();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow serving PDFs across origin if needed
app.use(cors());
app.use(express.json());

// Initialize Socket.io
const io = socket.init(server);
io.on('connection', (socket) => {
  console.log('Client connected to socket:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/jobs', jobRoutes);
app.use('/candidates', candidateRoutes);
app.use('/workflow', workflowRoutes);
app.use('/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
