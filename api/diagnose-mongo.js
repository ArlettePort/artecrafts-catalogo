import { MongoClient } from 'mongodb';

export default async (req, res) => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      return res.status(500).json({ error: 'MONGODB_URI undefined' });
    }

    console.log('Attempting connection...');
    const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 3000 });

    await client.connect();
    console.log('Connected!');

    const ping = await client.db('admin').command({ ping: 1 });
    await client.close();

    res.json({ status: 'connected', ping });
  } catch (err) {
    console.error('MongoDB Error:', err.message);
    res.status(500).json({
      error: err.message,
      name: err.name,
      code: err.code
    });
  }
};
