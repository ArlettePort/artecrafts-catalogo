import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI no está definida en .env.local');
  process.exit(1);
}

let cached = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Schemas
const productVariantSchema = new mongoose.Schema({
  id: String,
  name: String,
  inStock: Boolean,
});

const productSchema = new mongoose.Schema(
  {
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
      type: String,
      options: [productVariantSchema],
    },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    iconName: { type: String, required: true },
    image: { type: String, required: true },
    tagline: { type: String, required: true },
    description: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      postalCode: String,
    },
    items: [
      {
        productId: String,
        productName: String,
        quantity: Number,
        price: Number,
      },
    ],
    total: Number,
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    notes: String,
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// Routes: Products
app.get('/api/products', async (req, res) => {
  try {
    await connectDB();
    const { category, featured, status } = req.query;
    let query = {};
    if (category && category !== 'all') query.category = category;
    if (featured) query.isFeatured = true;
    if (status) query.status = status;

    let products;
    try {
      products = await Product.find(query).sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.log('Sort by createdAt failed, trying without sort:', e.message);
      products = await Product.find(query).lean();
    }

    const transformed = products.map((prod) => ({
      ...prod,
      id: prod._id.toString(),
      _id: undefined,
    })).filter((p) => p);

    res.status(200).json(transformed);
  } catch (error) {
    console.error('GET /api/products error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    await connectDB();
    const product = await Product.create(req.body);
    const prodObj = product.toObject();
    res.status(201).json({
      ...prodObj,
      id: prodObj._id.toString(),
    });
  } catch (error) {
    console.error('POST /api/products error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    let product;
    try {
      product = await Product.findByIdAndUpdate(id, req.body, { new: true });
    } catch (e) {
      product = await Product.findOneAndUpdate({ id }, req.body, { new: true });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const prodObj = product.toObject();
    res.status(200).json({
      ...prodObj,
      id: prodObj._id.toString(),
    });
  } catch (error) {
    console.error('PUT /api/products error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    let product;
    try {
      product = await Product.findByIdAndDelete(id);
    } catch (e) {
      product = await Product.findOneAndDelete({ id });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    console.error('DELETE /api/products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Routes: Categories
app.get('/api/categories', async (req, res) => {
  try {
    await connectDB();
    let categories;
    try {
      categories = await Category.find({ status: 'active' }).sort({ createdAt: 1 }).lean();
    } catch (e) {
      console.log('Sort by createdAt failed, trying without sort:', e.message);
      categories = await Category.find({ status: 'active' }).lean();
    }
    const transformed = categories.map((cat) => ({
      ...cat,
      id: cat._id.toString(),
      _id: undefined,
    })).filter((c) => c);
    res.status(200).json(transformed);
  } catch (error) {
    console.error('GET /api/categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    await connectDB();
    const category = await Category.create(req.body);
    const catObj = category.toObject();
    res.status(201).json({
      ...catObj,
      id: catObj._id.toString(),
    });
  } catch (error) {
    console.error('POST /api/categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categories', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    let category;
    try {
      category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    } catch (e) {
      category = await Category.findOneAndUpdate({ id }, req.body, { new: true });
    }
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const catObj = category.toObject();
    res.status(200).json({
      ...catObj,
      id: catObj._id.toString(),
    });
  } catch (error) {
    console.error('PUT /api/categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    let category;
    try {
      category = await Category.findByIdAndDelete(id);
    } catch (e) {
      category = await Category.findOneAndDelete({ id });
    }
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    console.error('DELETE /api/categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Routes: Orders
app.get('/api/orders', async (req, res) => {
  try {
    await connectDB();
    let orders;
    try {
      orders = await Order.find().sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.log('Sort by createdAt failed, trying without sort:', e.message);
      orders = await Order.find().lean();
    }
    const transformed = orders.map((ord) => ({
      ...ord,
      id: ord._id.toString(),
      _id: undefined,
    })).filter((o) => o);
    res.status(200).json(transformed);
  } catch (error) {
    console.error('GET /api/orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    await connectDB();
    const orderData = {
      ...req.body,
      orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    };
    const order = await Order.create(orderData);
    const ordObj = order.toObject();
    res.status(201).json({
      ...ordObj,
      id: ordObj._id.toString(),
    });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    let order;
    try {
      order = await Order.findByIdAndUpdate(id, req.body, { new: true });
    } catch (e) {
      order = await Order.findOneAndUpdate({ id }, req.body, { new: true });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const ordObj = order.toObject();
    res.status(200).json({
      ...ordObj,
      id: ordObj._id.toString(),
    });
  } catch (error) {
    console.error('PUT /api/orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders', async (req, res) => {
  try {
    await connectDB();
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    let order;
    try {
      order = await Order.findByIdAndDelete(id);
    } catch (e) {
      order = await Order.findOneAndDelete({ id });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted' });
  } catch (error) {
    console.error('DELETE /api/orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({ status: 'OK', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'Error', database: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ API Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready\n`);
});
