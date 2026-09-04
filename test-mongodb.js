import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('\n🔍 Pruebando conexión a MongoDB...\n');
console.log(`📍 URI: ${MONGODB_URI}\n`);

if (!MONGODB_URI) {
  console.log('❌ Error: MONGODB_URI no está configurada en .env.local');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, {
    bufferCommands: false,
  })
  .then(() => {
    console.log('✅ Conectado a MongoDB exitosamente!');
    console.log(`📊 Base de datos: ${mongoose.connection.db.name}`);
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ Error de conexión a MongoDB:');
    console.log(`   Tipo: ${error.name}`);
    console.log(`   Mensaje: ${error.message}`);

    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Posible causa: DNS no resolvió el servidor');
      console.log('   Verifica tu conexión a internet');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n💡 Posible causa: Credenciales incorrectas');
      console.log('   Verifica usuario/contraseña en .env.local');
    } else if (error.message.includes('connection timeout')) {
      console.log('\n💡 Posible causa: Timeout de conexión');
      console.log('   Verifica que tu IP está en el Whitelist');
    }

    process.exit(1);
  });
