import mongoose from 'mongoose';
import { config } from './index.js';

export let isReplicaSet = false;

export async function connectDB() {
  try {
    mongoose.set('strictQuery', false);
    
    // 1. Attempt Primary Atlas connection
    try {
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 3000
      });
      console.log('✅ Connected to MongoDB Atlas Cloud');
      isReplicaSet = true;
      return;
    } catch (err) {
      console.warn('⚠️ Primary Atlas connection failed, trying fallback connection...');
    }

    // 2. Attempt Fallback Atlas connection
    try {
      await mongoose.connect(config.mongoUriFallback, {
        serverSelectionTimeoutMS: 3000
      });
      console.log('✅ Connected to MongoDB Atlas Cloud Fallback');
      isReplicaSet = false;
      return;
    } catch (err) {
      console.warn('⚠️ Fallback Atlas connection failed, trying Local MongoDB...');
    }

    // 3. Attempt Local MongoDB Instance
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/fams-db', {
        serverSelectionTimeoutMS: 2000
      });
      console.log('✅ Connected to Local MongoDB (mongodb://127.0.0.1:27017/fams-db)');
      isReplicaSet = false;
      return;
    } catch (err) {
      console.warn('⚠️ Local MongoDB unreachable, launching In-Memory MongoDB Server...');
    }

    // 4. In-Memory MongoDB Server (Zero-Config Fallback)
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('⚡ Connected to In-Memory MongoDB Server (Zero-Config Development Mode)');
      isReplicaSet = false;
      return;
    } catch (err) {
      console.error('❌ Could not start In-Memory Mongo Fallback:', err.message);
    }

    throw new Error('Unable to connect to MongoDB Atlas Cloud, Local MongoDB, or In-Memory MongoDB.');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('--------------------------------------------------------------------------------');
    console.error('👉 QUICK FIX 1 (Atlas Cloud): Whitelist your current IP on MongoDB Atlas Dashboard');
    console.error('   1. Go to https://cloud.mongodb.com -> Network Access -> Add IP Address');
    console.error('   2. Select "Allow Access From Anywhere" (0.0.0.0/0) & click Confirm.');
    console.error('👉 QUICK FIX 2 (Zero-Config Offline Mode): Run this in terminal:');
    console.error('   npm i mongodb-memory-server --save-dev');
    console.error('--------------------------------------------------------------------------------');
    process.exit(1);
  }
}

/**
 * Execute Mongoose transaction if replica set available, otherwise standard session-less execution
 */
export async function withTransaction(fn) {
  if (isReplicaSet) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await fn(session);
      await session.commitTransaction();
      session.endSession();
      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } else {
    // Non-transactional fallback for standalone development instances
    return await fn(null);
  }
}
