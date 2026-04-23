const mongoose = require('mongoose');

// default to local if env is missing
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flower_billing';

const connect = async () => {
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
    return true;
  } catch (err) {
    console.log('MongoDB connection error:', err.message);
    // TODO: maybe retry connection?
    return false;
  }
};

module.exports = { connectMongo: connect, mongoose };
