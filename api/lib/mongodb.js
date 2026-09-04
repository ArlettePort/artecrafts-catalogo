import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

let cached = global;

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    cached.mongoose.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongoose) => mongoose);
  }

  cached.mongoose.conn = await cached.mongoose.promise;
  return cached.mongoose.conn;
}
