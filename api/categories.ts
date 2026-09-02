import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from './lib/mongodb';
import { Category } from './models/Category';

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
      const categories = await Category.find({ status: 'active' }).sort({ createdAt: 1 });
      res.status(200).json(categories);
    } else if (req.method === 'POST') {
      const category = await Category.create(req.body);
      res.status(201).json(category);
    } else if (req.method === 'PUT') {
      const { id } = req.query;
      const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json(category);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      await Category.findByIdAndDelete(id);
      res.status(200).json({ message: 'Category deleted' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
