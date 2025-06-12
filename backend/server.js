const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const socketIo = require('socket.io');
const { connectDB } = require('./config/mongodb'); // MongoDB connection only
const { swaggerUi, swaggerDocs } = require('./swagger');
const { apiLimiter } = require('./middleware/rateLimit');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Load environment variables - must be before importing config
dotenv.config({
  path: path.join(__dirname, '.env')
});

const config = require('./config/config');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
const PORT = config.port;

// Apply CORS configuration - must be first
app.use(cors(config.cors));

// Handle preflight requests
app.options('*', cors(config.cors));

// Other middleware
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); // Limit request size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet()); // Add security headers
app.use(morgan('combined', { stream: logger.stream })); // HTTP request logging

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message
 *     description: Returns a welcome message for the API
 *     responses:
 *       200:
 *         description: Welcome message
 */
// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the Teacher Assistant API');
});

/**
 * @swagger
 * /api/health-check:
 *   get:
 *     summary: Health check
 *     description: Check if the API is running
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: API is running
 */
// Health check route
app.get('/api/health-check', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// MongoDB-only routes setup
logger.info('Using MongoDB database exclusively');

// Import MongoDB routes
const authRoutes = require('./routes/consolidated/auth');
const attendanceRoutes = require('./routes/consolidated/attendance');
const healthCheckRoutes = require('./routes/health-check');
const facultyRoutes = require('./routes/mongodb-faculty');
const studentRoutes = require('./routes/mongodb-student');
const courseRoutes = require('./routes/mongodb-course');
const enrollmentRoutes = require('./routes/mongodb-enrollment-fixed');
const markRoutes = require('./routes/mongodb-mark-fixed');
const adminAuthRoutes = require('./routes/admin-auth');
const adminDashboardRoutes = require('./routes/adminDashboard');
const courseAllocationRoutes = require('./routes/courseAllocation');

// Import new routes for question bank and subjects
const questionBankRoutes = require('./routes/question-bank');
const subjectsRoutes = require('./routes/subjects');

// Messaging routes
const messageRoutes = require('./routes/messages');

// Parent authentication and dashboard routes (MongoDB)
const parentAuthRoutes = require('./routes/mongodb-parentAuth');
const parentDashboardRoutes = require('./routes/mongodb-parentDashboard-enhanced');

// Try to load admin routes if they exist
let adminRoutes = null;
try {
  adminRoutes = require('./routes/mongodb-admin');
} catch (error) {
  logger.info('MongoDB admin routes not found, using custom admin dashboard routes');
}

// Socket.IO Real-time Messaging Setup
const jwt = require('jsonwebtoken');
const connectedUsers = new Map(); // Store connected users and their socket IDs

// Socket.IO authentication middleware
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication token required'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
};

io.use(authenticateSocket);

io.on('connection', (socket) => {
  const user = socket.user;
  logger.info(`User ${user.id} (${user.role}) connected via Socket.IO`);
  
  // Store user connection
  connectedUsers.set(user.id, {
    socketId: socket.id,
    userId: user.id,
    role: user.role,
    lastSeen: new Date()
  });
  
  // Join user to their personal room for direct messaging
  socket.join(`user_${user.id}`);
  
  // Handle joining conversation rooms
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    logger.info(`User ${user.id} joined conversation ${conversationId}`);
  });
  
  // Handle leaving conversation rooms
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    logger.info(`User ${user.id} left conversation ${conversationId}`);
  });
  
  // Handle new message events
  socket.on('send_message', async (messageData) => {
    try {
      // Emit to conversation room
      socket.to(`conversation_${messageData.conversationId}`).emit('new_message', messageData);
      
      // Emit to receiver's personal room
      socket.to(`user_${messageData.receiverId}`).emit('new_message', messageData);
      
      // Send delivery confirmation to sender
      socket.emit('message_delivered', { messageId: messageData._id });
      
      logger.info(`Message sent from ${user.id} to conversation ${messageData.conversationId}`);
    } catch (error) {
      logger.error('Error handling send_message event:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });
  
  // Handle typing indicators
  socket.on('typing_start', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
      userId: user.id,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      conversationId: data.conversationId
    });
  });
  
  socket.on('typing_stop', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_stopped_typing', {
      userId: user.id,
      conversationId: data.conversationId
    });
  });
  
  // Handle message read receipts
  socket.on('message_read', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('message_read_by', {
      messageId: data.messageId,
      readBy: user.id,
      readAt: new Date()
    });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`User ${user.id} (${user.role}) disconnected from Socket.IO`);
    connectedUsers.delete(user.id);
  });
});

// Make io available to routes
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', parentAuthRoutes); // Parent auth routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminDashboardRoutes); // Admin dashboard routes
app.use('/api/faculty', facultyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/course-allocation', courseAllocationRoutes);
app.use('/api/parents', parentDashboardRoutes); // Parent dashboard routes
app.use('/api/messages', messageRoutes); // Messaging routes
app.use('/api/question-bank', questionBankRoutes); // Question bank routes
app.use('/api/subjects', subjectsRoutes); // Subjects routes

// Import authentication middleware
const auth = require('./middleware/auth');
const roleAuth = require('./middleware/roleAuth');

// Add admin routes if available
if (adminRoutes) {
  app.use('/api/admin', adminRoutes);
}

app.use('/api', healthCheckRoutes);

// Debug routes endpoint - secured with authentication and admin role
// Only available in non-production environments
if (process.env.NODE_ENV !== 'production') {
  app.get('/debug-routes', auth, roleAuth(['admin']), (req, res) => {
    const routes = [];
    
    function print(path, layer) {
    if (layer.route) {
      layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))));
    } else if (layer.name === 'router' && layer.handle.stack) {
      layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp.source.replace('\\/?(?=\\/|$)', '').replace('\\^\\', '').replace('\\$', '')))));
    } else if (layer.method) {
      routes.push({
        method: layer.method.toUpperCase(),
        path: path.concat(split(layer.regexp.source.replace('\\/?(?=\\/|$)', '').replace('\\^\\', '').replace('\\$', ''))).filter(Boolean).join('/')
      });
    }
  }
  
  function split(thing) {
    if (typeof thing === 'string') {
      return thing.split('/');
    } else if (thing.fast_slash) {
      return [''];
    } else {
      var match = thing.toString()
        .replace('\\/?', '')
        .replace('(?=\\/|$)', '$')
        .match(/^\^\\(\/(?:[^\/\\()[\]\\?\\+\\*]*\\[^][^\\()[\]]*)*)/);
      return match ? match[1].replace(/\\(.)/g, '$1').split('/') : ['<complex>'];
    }
  }
  
  app._router.stack.forEach(print.bind(null, []));
  
    res.json(routes);
  });
}

// Add debug route before the 404 handler - secured with authentication and admin role
// Only available in non-production environments
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug-config', auth, roleAuth(['admin']), (req, res) => {
    res.json({
      dbType: config.db.type,
      isMongoDb: config.db.type === 'mongodb',
      envDbType: process.env.DB_TYPE,
      availableRoutes: {
        auth: !!authRoutes,
        faculty: !!facultyRoutes,
        student: !!studentRoutes
      }
    });
  });
}

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    // Connect to MongoDB
    await connectDB();
    logger.info('MongoDB connected successfully');
    console.log('MongoDB connected successfully');
    
    // Start listening
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error(`Error starting server: ${error.message}`);
    console.error(`Error starting server: ${error.message}`, error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server
});

module.exports = app; // For testing purposes