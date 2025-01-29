import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';  // Fallback to localhost

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, { 
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

export default connectDB;
