// IMPORTANT: Import database FIRST to avoid circular dependency
import { getSequelize } from './config/database';
import { config } from './config/app';
import app from './app';
import { initializeFirebase } from './utils/firebase';
import { createServer } from 'http';
import { initializeSocketServer } from './socket';

const PORT = config.app.port;

// Start server
const startServer = async () => {
  try {
    // Initialize Firebase (optional)
    try {
      initializeFirebase();
      console.log('✅ Firebase initialized successfully');
    } catch (error: any) {
      console.warn('⚠️  Firebase not configured (optional):', error.message);
    }

    // Connect to database
    try {
      const sequelize = getSequelize();
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully');
    } catch (error: any) {
      console.error('❌ Database connection failed:', error.message);
      console.warn('⚠️  Server starting without database connection.');
    }

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO
    initializeSocketServer(httpServer);
    console.log('✅ Socket.IO server initialized');

    // Start listening
    httpServer.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║   🚀 ${config.app.name} API Server         ║
║   📡 Running on port ${PORT}              ║
║   🌍 Environment: ${config.app.env.padEnd(13)} ║
║   📊 Database: MySQL                   ║
║   🔌 WebSocket: Enabled                ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

startServer();
