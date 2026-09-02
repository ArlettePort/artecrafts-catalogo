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

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    customer: customerInfoSchema,
    items: [cartItemSchema],
    total: Number,
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    notes: String,
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
