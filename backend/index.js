import dotenv from 'dotenv';

// Load environment variables as early as possible
dotenv.config();

import app, { server } from "./api/index.js";

// Start server for both local development and production
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Socket.IO enabled`);
});