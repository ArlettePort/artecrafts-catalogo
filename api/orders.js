import mongoose from 'mongoose';

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
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
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
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return res.status(500).json({ error: 'MONGODB_URI not configured' });
    }

    // Connect if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { bufferCommands: false });
    }

    if (req.method === 'GET') {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.status(200).json(orders);
    }
    if (req.method === 'POST') {
      const orderData = {
        ...req.body,
        orderNumber: generateOrderNumber(),
      };
      const order = await Order.create(orderData);
      return res.status(201).json(order);
    }
    if (req.method === 'PUT') {
      const { id } = req.query;
      const order = await Order.findByIdAndUpdate(id, req.body, { new: true });
      return res.status(200).json(order);
    }
    if (req.method === 'DELETE') {
      const { id } = req.query;
      await Order.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Order deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
