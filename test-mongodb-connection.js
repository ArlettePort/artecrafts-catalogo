import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('❌ MONGODB_URI no está definida');
  process.exit(1);
}

console.log('📍 URI:', mongoUri.substring(0, 50) + '...');
console.log('🔄 Intentando conectar...\n');

const client = new MongoClient(mongoUri, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
});

try {
  await client.connect();
  console.log('✅ Conexión exitosa!');

  const admin = client.db('admin');
  const ping = await admin.command({ ping: 1 });
  console.log('✅ Ping exitoso:', ping);

  const db = client.db('artecrafts');
  const categories = await db.collection('categories').find({}).limit(1).toArray();
  console.log('✅ Colecciones accesibles');
  console.log('📊 Categorías encontradas:', categories.length);

  await client.close();
  console.log('\n✅ Todo funciona correctamente!');
} catch (error) {
  console.error('\n❌ Error de conexión:');
  console.error('Nombre:', error.name);
  console.error('Mensaje:', error.message);
  console.error('Código:', error.code);
  if (error.reason) {
    console.error('Razón:', error.reason);
  }
  process.exit(1);
}
