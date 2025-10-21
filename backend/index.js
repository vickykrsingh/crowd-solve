import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Database connection
import connectDB from './lib/db.js';

// Routes
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

// Initialize express app
const app = express();

// Determine environment
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

// --- Simplified CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5173',              // Vite local
  'http://localhost:3000',              // Next.js local
  'https://crowdsolved.vercel.app',     // Deployed frontend
  process.env.CLIENT_URL                // Optional env override
].filter(Boolean);
console.log(allowedOrigins)
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Health Check Route ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Crowd Solve API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cloudinary: {
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'not set'
    }
  });
});

// --- Test Upload Route ---
import { uploadSingle, uploadToCloudinary } from './lib/upload.js';

app.post('/api/test-upload', uploadSingle, async (req, res) => {
  try {
    console.log('=== TEST UPLOAD ===');
    console.log('File received:', !!req.file);
    console.log('Environment:', process.env.NODE_ENV);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded',
        debug: {
          headers: req.headers['content-type'],
          body: Object.keys(req.body)
        }
      });
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: !!req.file.buffer
    });

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'crowd-solve/test'
    });

    console.log('Upload success:', result.secure_url);

    res.json({
      success: true,
      message: 'Upload successful',
      data: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed',
      error: error.message 
    });
  }
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/solutions', solutionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upvotes', upvoteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// --- Default API Route ---
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

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// --- Socket.IO Setup (only for local/dev) ---
if (!isProduction) {
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  const activeViewers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join notification room
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      socket.userId = userId;
    });

    // Problem viewer tracking
    socket.on('join-problem', (problemId) => {
      socket.join(`problem-${problemId}`);
      if (!activeViewers.has(problemId)) {
        activeViewers.set(problemId, new Set());
      }
      activeViewers.get(problemId).add(socket.id);

      const viewerCount = activeViewers.get(problemId).size;
      io.to(`problem-${problemId}`).emit('active-viewers-updated', {
        problemId,
        activeViewers: viewerCount
      });
    });

    socket.on('leave-problem', (problemId) => {
      socket.leave(`problem-${problemId}`);
      if (activeViewers.has(problemId)) {
        activeViewers.get(problemId).delete(socket.id);
        if (activeViewers.get(problemId).size === 0) {
          activeViewers.delete(problemId);
        }
        const viewerCount = activeViewers.has(problemId) ? activeViewers.get(problemId).size : 0;
        io.to(`problem-${problemId}`).emit('active-viewers-updated', {
          problemId,
          activeViewers: viewerCount
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      if (socket.userId) socket.leave(`user-${socket.userId}`);

      for (const [problemId, viewers] of activeViewers) {
        if (viewers.has(socket.id)) {
          viewers.delete(socket.id);
          if (viewers.size === 0) activeViewers.delete(problemId);

          const viewerCount = activeViewers.has(problemId)
            ? activeViewers.get(problemId).size
            : 0;
          io.to(`problem-${problemId}`).emit('active-viewers-updated', {
            problemId,
            activeViewers: viewerCount
          });
        }
      }
    });
  });

  app.set('socketio', io);

  // Start server only locally
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// --- Export Express App for Vercel ---
export default app;
