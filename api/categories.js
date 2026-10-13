import { MongoClient, ObjectId } from 'mongodb';

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
    // Create new client for each request (no caching for serverless)
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
    const collection = db.collection('categories');

    if (req.method === 'GET') {
      let categories;
      try {
        categories = await collection
          .find({ status: 'active' })
          .sort({ createdAt: 1 })
          .toArray();
      } catch (e) {
        console.log('Sort failed, trying without sort');
        categories = await collection.find({ status: 'active' }).toArray();
      }

      const transformed = categories.map((c) => ({
        ...c,
        id: c._id?.toString() || c.id,
      }));
      return res.status(200).json(transformed);
    }

    if (req.method === 'POST') {
      const result = await collection.insertOne({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return res.status(201).json({ _id: result.insertedId, ...req.body });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }
      let result;
      try {
        result = await collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { ...req.body, updatedAt: new Date() } },
          { returnDocument: 'after' }
        );
      } catch (e) {
        result = await collection.findOneAndUpdate(
          { id },
          { $set: { ...req.body, updatedAt: new Date() } },
          { returnDocument: 'after' }
        );
      }
      if (!result.value) {
        return res.status(404).json({ error: 'Category not found' });
      }
      return res.status(200).json(result.value);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }
      let result;
      try {
        result = await collection.deleteOne({ _id: new ObjectId(id) });
      } catch (e) {
        result = await collection.deleteOne({ id });
      }
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      return res.status(200).json({ message: 'Category deleted' });
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
