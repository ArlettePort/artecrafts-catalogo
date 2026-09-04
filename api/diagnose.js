import mongoose from 'mongoose';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    return res.status(500).json({
      error: 'MONGODB_URI not configured',
      mongodb_uri_defined: false
    });
  }

  try {
    // Test 1: Check connection state
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    res.status(200).json({
      status: 'diagnosing',
      mongodb_uri_defined: true,
      current_state: states[connectionState],
      current_state_code: connectionState,
      attempting_connection: true,
      timestamp: new Date().toISOString()
    });

    // Attempt connection in background (non-blocking)
    if (connectionState === 0) {
      mongoose.connect(mongoUri, { bufferCommands: false })
        .then(() => console.log('✅ MongoDB connected'))
        .catch(err => console.error('❌ MongoDB connection failed:', err.message));
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
