import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { connectDB } from './lib/mongodb';
import { AdminUser } from './models/AdminUser';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'POST') {
      const { action, email, password, name } = req.body;

      if (action === 'register') {
        const existingUser = await AdminUser.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ error: 'User already exists' });
        }

        const user = await AdminUser.create({
          name,
          email,
          password,
          role: 'admin',
        });

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
          expiresIn: '7d',
        });

        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
      } else if (action === 'login') {
        const user = await AdminUser.findOne({ email });
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await (user as any).comparePassword(password);
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
          expiresIn: '7d',
        });

        res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
