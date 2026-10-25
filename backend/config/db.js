const dns = require('dns');
const mongoose = require('mongoose');

// Ensure reliable SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fitness-tracker';
  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(`MongoDB connected: ${conn.connection.host} (Database: ${conn.connection.name})`);
  } catch (error) {
    console.warn(`Could not connect to MongoDB at ${uri} (${error.message}). Attempting in-memory MongoDB fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      console.log(`MongoDB connected via MongoMemoryServer: ${conn.connection.host} (Database: ${conn.connection.name})`);
    } catch (memError) {
      console.error(`Error connecting to MongoDB: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

