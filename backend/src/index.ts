import dotenv from 'dotenv';
// Load environment variables before importing other files
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5001;

// Connect to MongoDB Database
connectDB();

// Start Server
const server = app.listen(PORT, () => {
  console.log(`[Server] running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err: any) => {
  console.error('[Unhandled Rejection] Shutting down due to unhandled promise rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});
