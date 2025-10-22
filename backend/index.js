import dotenv from 'dotenv';

// Load environment variables as early as possible
dotenv.config();

import app from "./api/index.js";

// For local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(8080, () => {
    console.log("Server is running on port 8080");
  });
}

// Export for Vercel
export default app;