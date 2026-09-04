const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  iconName: { type: String, required: true },
  image: { type: String, required: true },
  tagline: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

module.exports = async (req, res) => {
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

  try {
    // Connect if not connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      });
    }

    if (req.method === 'GET') {
      const categories = await Category.find({ status: 'active' }).sort({ createdAt: 1 });
      return res.status(200).json(categories);
    }
    if (req.method === 'POST') {
      const category = await Category.create(req.body);
      return res.status(201).json(category);
    }
    if (req.method === 'PUT') {
      const { id } = req.query;
      const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(category);
    }
    if (req.method === 'DELETE') {
      const { id } = req.query;
      await Category.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Category deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('MongoDB Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
