import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from './lib/mongodb';
import { Order } from './models/Order';

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

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
      const orders = await Order.find().sort({ createdAt: -1 });
      res.status(200).json(orders);
    } else if (req.method === 'POST') {
      const orderData = {
        ...req.body,
        orderNumber: generateOrderNumber(),
      };
      const order = await Order.create(orderData);
      res.status(201).json(order);
    } else if (req.method === 'PUT') {
      const { id } = req.query;
      const order = await Order.findByIdAndUpdate(id, req.body, { new: true });
      res.status(200).json(order);
    } else if (req.method === 'DELETE') {
      const { id } = req.query;
      await Order.findByIdAndDelete(id);
      res.status(200).json({ message: 'Order deleted' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
