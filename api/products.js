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
    const collection = db.collection('products');

    if (req.method === 'GET') {
      const { category, featured, status } = req.query;
      let query = {};
      if (category && category !== 'all') query.category = category;
      if (featured) query.isFeatured = true;
      if (status) query.status = status;

      let products;
      try {
        products = await collection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();
      } catch (e) {
        console.log('Sort failed, trying without sort');
        products = await collection.find(query).toArray();
      }

      const transformed = products.map((p) => ({
        ...p,
        id: p._id?.toString() || p.id,
      }));
      return res.status(200).json(transformed);
    }

    if (req.method === 'POST') {
      const productData = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Ensure variants is properly formatted
      if (productData.variants && typeof productData.variants === 'object') {
        productData.variants = {
          type: productData.variants.type || '',
          options: Array.isArray(productData.variants.options) ? productData.variants.options : [],
        };
      }

      const result = await collection.insertOne(productData);
      return res.status(201).json({ _id: result.insertedId, ...productData });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'ID is required' });
      }

      const updateData = {
        ...req.body,
        updatedAt: new Date(),
      };

      // Ensure variants is properly formatted
      if (updateData.variants && typeof updateData.variants === 'object') {
        updateData.variants = {
          type: updateData.variants.type || '',
          options: Array.isArray(updateData.variants.options) ? updateData.variants.options : [],
        };
      }

      let result;
      try {
        result = await collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: 'after' }
        );
      } catch (e) {
        result = await collection.findOneAndUpdate(
          { id },
          { $set: updateData },
          { returnDocument: 'after' }
        );
      }
      if (!result.value) {
        return res.status(404).json({ error: 'Product not found' });
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
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.status(200).json({ message: 'Product deleted' });
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
