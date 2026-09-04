const { MongoClient, ObjectId } = require('mongodb');

let cachedClient = null;

async function connectDB() {
  if (cachedClient) {
    return cachedClient;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not configured');
  }

  try {
    const client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    throw error;
  }
}

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const client = await connectDB();
    const db = client.db('artecrafts');
    const collection = db.collection('orders');

    if (req.method === 'GET') {
      const orders = await collection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      return res.status(200).json(orders);
    }

    if (req.method === 'POST') {
      const orderData = {
        ...req.body,
        orderNumber: generateOrderNumber(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const result = await collection.insertOne(orderData);
      return res.status(201).json({ _id: result.insertedId, ...orderData });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...req.body, updatedAt: new Date() } },
        { returnDocument: 'after' }
      );
      return res.status(200).json(result.value);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await collection.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ message: 'Order deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
