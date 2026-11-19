require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 ShopSphere API Server running in [${process.env.NODE_ENV || 'development'}] mode`);
  console.log(`🌐 Listening on: http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Process Error] Unhandled Rejection: ${err.message}`);
  // In production, close server and exit gracefully
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});
