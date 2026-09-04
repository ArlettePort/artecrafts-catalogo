const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
  id: String,
  name: String,
  inStock: Boolean,
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: Number,
  images: [String],
  mainImage: String,
  description: { type: String, required: true },
  shortDescription: String,
  materials: [String],
  dimensions: String,
  stock: { type: Number, default: 0 },
  manageStock: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  isNew: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ['published', 'hidden', 'draft'], default: 'draft' },
  rating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 },
  variants: {
    type: { type: String },
    options: [productVariantSchema],
  },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

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
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      });
    }

    if (req.method === 'GET') {
      const { category, featured, status } = req.query;
      let query = {};
      if (category && category !== 'all') query.category = category;
      if (featured) query.isFeatured = true;
      if (status) query.status = status;

      const products = await Product.find(query).sort({ createdAt: -1 });
      return res.status(200).json(products);
    }
    if (req.method === 'POST') {
      const product = await Product.create(req.body);
      return res.status(201).json(product);
    }
    if (req.method === 'PUT') {
      const { id } = req.query;
      const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(product);
    }
    if (req.method === 'DELETE') {
      const { id } = req.query;
      await Product.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Product deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('MongoDB Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
