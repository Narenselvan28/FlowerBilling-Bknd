const mongoose = require('mongoose');

// default to local if env is missing
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flower_billing';

const connect = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    // Log masked URI for debug
    const maskedUri = uri.replace(/\/\/.*@/, '//<user>:<password>@');
    console.log('Using URI:', maskedUri);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (err) {
    console.log('MongoDB connection error:', err.message);
    return false;
  }
};

module.exports = { connectMongo: connect, mongoose };
