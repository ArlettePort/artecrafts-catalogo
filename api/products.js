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
      const { category, featured, status } = req.query;
      let query = {};

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
    console.error('Products API Error:', error);
    res.status(500).json({ error: error.message, type: error.constructor.name });
  }
}
