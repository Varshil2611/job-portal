import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'job-portal',
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️   MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌  MongoDB error:', err.message);
    });
  } catch (err) {
    console.error('❌  MongoDB connection error:', err.message);
    throw err;
  }
};

export default connectDB;