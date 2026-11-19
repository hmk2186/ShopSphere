const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/shopsphere';
    
    // Set mongoose options
    const conn = await mongoose.connect(connStr, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[MongoDB] Connected Successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
    
    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from database');
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection Failure: ${error.message}`);
    console.error('[MongoDB] Please ensure your MONGODB_URI in .env is valid (MongoDB Atlas or local mongod).');
    // Don't exit immediately in dev so developers see the clear server output
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
