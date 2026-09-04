import mongoose from 'mongoose';

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
      type: { type: String },
      options: [productVariantSchema],
    },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
