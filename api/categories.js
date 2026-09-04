import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cachedConn = null;

async function connectDB() {
  if (cachedConn) return cachedConn;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI not defined');
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    cachedConn = conn;
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  iconName: { type: String, required: true },
  image: { type: String, required: true },
  tagline: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

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
    console.error('Categories API Error:', error);
    res.status(500).json({ error: error.message, type: error.constructor.name });
  }
}
