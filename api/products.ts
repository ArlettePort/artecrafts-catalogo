import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from './lib/mongodb';
import { Product } from './models/Product';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { category, featured, status } = req.query;
      let query: any = {};

      if (category && category !== 'all') {
        query.category = category;
      }
      if (featured) {
        query.isFeatured = true;
      }
      if (status) {
        query.status = status;
      }

      const products = await Product.find(query).sort({ createdAt: -1 });
      res.status(200).json(products);
    } else if (req.method === 'POST') {
      const product = await Product.create(req.body);
      res.status(201).json(product);
    } else if (req.method === 'PUT') {
      const { id } = req.query;
      const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json(product);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      await Product.findByIdAndDelete(id);
      res.status(200).json({ message: 'Product deleted' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
