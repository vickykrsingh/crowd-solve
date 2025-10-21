import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';

import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import problemRoutes from './routes/problems.js';
import solutionRoutes from './routes/solutions.js';
import commentRoutes from './routes/comments.js';
import upvoteRoutes from './routes/upvotes.js';
import notificationRoutes from './routes/notifications.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/solutions', solutionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upvotes', upvoteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

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

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});