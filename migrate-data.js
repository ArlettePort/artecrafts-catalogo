import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI no está definida en .env.local');
  process.exit(1);
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
      type: { type: String },
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
        product: Object,
        quantity: Number,
        selectedVariant: String,
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

async function migrateData() {
  try {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log('✅ Conectado a MongoDB\n');

    // Datos de ejemplo para migrar
    // IMPORTANTE: Estos son los datos que deberían estar en tu localStorage
    const productsToMigrate = [
      // Aquí irían tus productos del localStorage
      // Ejemplo:
      // {
      //   id: "prod-xxx",
      //   name: "Mi Producto",
      //   category: "ceramica",
      //   price: 25,
      //   description: "...",
      //   images: ["url"],
      //   mainImage: "url",
      //   stock: 10,
      //   status: "published"
      // }
    ];

    const categoriesToMigrate = [
      // Aquí irían tus categorías del localStorage
    ];

    const ordersToMigrate = [
      // Aquí irían tus pedidos del localStorage
    ];

    // Migrar productos
    if (productsToMigrate.length > 0) {
      console.log(`📦 Migrando ${productsToMigrate.length} productos...`);
      await Product.insertMany(productsToMigrate, { ordered: false });
      console.log(`✅ ${productsToMigrate.length} productos guardados\n`);
    } else {
      console.log('ℹ️  No hay productos para migrar\n');
    }

    // Migrar categorías
    if (categoriesToMigrate.length > 0) {
      console.log(`📂 Migrando ${categoriesToMigrate.length} categorías...`);
      await Category.insertMany(categoriesToMigrate, { ordered: false });
      console.log(`✅ ${categoriesToMigrate.length} categorías guardadas\n`);
    } else {
      console.log('ℹ️  No hay categorías para migrar\n');
    }

    // Migrar pedidos
    if (ordersToMigrate.length > 0) {
      console.log(`📋 Migrando ${ordersToMigrate.length} pedidos...`);
      await Order.insertMany(ordersToMigrate, { ordered: false });
      console.log(`✅ ${ordersToMigrate.length} pedidos guardados\n`);
    } else {
      console.log('ℹ️  No hay pedidos para migrar\n');
    }

    console.log('✅ Migración completada!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  }
}

migrateData();
