const { MongoClient } = require('mongodb');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const mongoUri = process.env.MONGODB_URI;

  try {
    if (!mongoUri) {
      return res.status(500).json({ error: 'MONGODB_URI undefined' });
    }

    const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });

    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected!');

    const db = client.db('artecrafts');
    const ping = await db.admin().ping();

    await client.close();

    res.status(200).json({
      status: 'connected',
      ping: ping.ok === 1,
      database: 'artecrafts',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MongoDB Error:', error);
    res.status(500).json({
      error: error.message,
      code: error.code,
      name: error.name
    });
  }
};
