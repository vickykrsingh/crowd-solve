import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import database connection
import connectDB from './lib/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import problemRoutes from './routes/problems.js';
import solutionRoutes from './routes/solutions.js';
import commentRoutes from './routes/comments.js';
import upvoteRoutes from './routes/upvotes.js';
import notificationRoutes from './routes/notifications.js';
import userRoutes from './routes/users.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app = express();

// Create server and Socket.IO setup for local development
let server, io;
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

if (!isProduction) {
  server = createServer(app);
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });
  
  // Store active viewers for each problem
  const activeViewers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal notification room
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      socket.userId = userId;
    });

    socket.on('join-problem', (problemId) => {
      socket.join(`problem-${problemId}`);
      
      // Track active viewers
      if (!activeViewers.has(problemId)) {
        activeViewers.set(problemId, new Set());
      }
      activeViewers.get(problemId).add(socket.id);
      
      // Broadcast current viewer count
      const viewerCount = activeViewers.get(problemId).size;
      io.to(`problem-${problemId}`).emit('active-viewers-updated', {
        problemId,
        activeViewers: viewerCount
      });
    });

    socket.on('leave-problem', (problemId) => {
      socket.leave(`problem-${problemId}`);
      
      // Remove from active viewers
      if (activeViewers.has(problemId)) {
        activeViewers.get(problemId).delete(socket.id);
        
        // Clean up empty sets
        if (activeViewers.get(problemId).size === 0) {
          activeViewers.delete(problemId);
        }
        
        // Broadcast updated viewer count
        const viewerCount = activeViewers.has(problemId) ? activeViewers.get(problemId).size : 0;
        io.to(`problem-${problemId}`).emit('active-viewers-updated', {
          problemId,
          activeViewers: viewerCount
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Leave user notification room
      if (socket.userId) {
        socket.leave(`user-${socket.userId}`);
      }
      
      // Remove user from all active viewers
      for (const [problemId, viewers] of activeViewers) {
        if (viewers.has(socket.id)) {
          viewers.delete(socket.id);
          
          // Clean up empty sets
          if (viewers.size === 0) {
            activeViewers.delete(problemId);
          }
          
          // Broadcast updated viewer count
          const viewerCount = activeViewers.has(problemId) ? activeViewers.get(problemId).size : 0;
          io.to(`problem-${problemId}`).emit('active-viewers-updated', {
            problemId,
            activeViewers: viewerCount
          });
        }
      }
    });
  });

  app.set('socketio', io);
}

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://crowdsolved.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

console.log('CORS allowed origins:', allowedOrigins);
console.log('Environment:', process.env.NODE_ENV);
console.log('Is Vercel:', !!process.env.VERCEL);

app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log('CORS allowed for:', origin);
      callback(null, true);
    } else {
      console.log('CORS blocked for:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Crowd Solve API is running',
    timestamp: new Date().toISOString()
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    isVercel: !!process.env.VERCEL
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/solutions', solutionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upvotes', upvoteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Default route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to Crowd Solve API',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/problems',
      '/api/solutions',
      '/api/comments',
      '/api/upvotes',
      '/api/notifications',
      '/api/users'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server for local development
if (!isProduction) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
export default app;