export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'OK',
    message: 'API funcionando correctamente',
    mongodb_uri_defined: !!process.env.MONGODB_URI,
    env_keys: Object.keys(process.env).filter(k => k.includes('MONGODB') || k.includes('JWT'))
  });
}
