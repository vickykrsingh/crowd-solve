import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

// Import database connection
import connectDB from '../lib/db.js';

// Import routes
import authRoutes from '../routes/auth.js';
import problemRoutes from '../routes/problems.js';
import solutionRoutes from '../routes/solutions.js';
import commentRoutes from '../routes/comments.js';
import upvoteRoutes from '../routes/upvotes.js';
import notificationRoutes from '../routes/notifications.js';
import userRoutes from '../routes/users.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Export the Express app for Vercel
export default app;