import mongoose from 'mongoose';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const mongoUri = process.env.MONGODB_URI;

  try {
    if (!mongoUri) {
      return res.status(500).json({ error: 'MONGODB_URI not defined' });
    }

    console.log('Attempting MongoDB connection...');
    console.log('URI starts with:', mongoUri.substring(0, 30) + '...');

    const conn = await mongoose.connect(mongoUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    const db = conn.connection.db;
    const adminDb = db.admin();
    const status = await adminDb.ping();

    res.status(200).json({
      status: 'Connected successfully',
      ping: status,
      database: db.name,
      host: conn.connection.host,
      port: conn.connection.port,
    });
  } catch (error) {
    console.error('MongoDB Error:', error);
    res.status(500).json({
      error: error.message,
      code: error.code,
      name: error.name,
      details: error.errmsg || 'No additional details'
    });
  }
}
