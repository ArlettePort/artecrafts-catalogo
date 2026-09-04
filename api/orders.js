import { MongoClient, ObjectId } from 'mongodb';

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
}

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    return res.status(500).json({ error: 'MONGODB_URI not configured' });
  }

  let client;
  try {
    client = new MongoClient(mongoUri, {
      maxPoolSize: 1,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 15000,
      connectTimeoutMS: 10000,
      retryWrites: true,
    });

    await client.connect();
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
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing client:', closeError);
      }
    }
  }
};
