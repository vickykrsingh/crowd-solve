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

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-problem', (problemId) => {
    socket.join(`problem-${problemId}`);
  });

  socket.on('leave-problem', (problemId) => {
    socket.leave(`problem-${problemId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.set('socketio', io);

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});