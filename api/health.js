export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    api: 'artecrafts-catalog',
    mongodb: process.env.MONGODB_URI ? 'configured' : 'not configured'
  });
}
