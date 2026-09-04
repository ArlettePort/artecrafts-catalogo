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

const cartItemSchema = new mongoose.Schema({
  product: {
    id: String,
    name: String,
    price: Number,
    images: [String],
  },
  quantity: Number,
  selectedVariant: String,
});

const customerInfoSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  address: String,
  city: String,
  notes: String,
  paymentMethod: { type: String, enum: ['whatsapp', 'transferencia', 'contra-entrega', 'tarjeta'] },
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: customerInfoSchema,
  items: [cartItemSchema],
  total: Number,
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  notes: String,
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

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
    console.error('Orders API Error:', error);
    res.status(500).json({ error: error.message, type: error.constructor.name });
  }
}
