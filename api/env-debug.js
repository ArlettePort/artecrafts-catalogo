export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const env = Object.keys(process.env).reduce((acc, key) => {
    if (key.includes('MONGO') || key.includes('JWT') || key.includes('VITE') || key.includes('NODE')) {
      const val = process.env[key];
      acc[key] = val ? `${val.substring(0, 20)}...` : 'UNDEFINED';
    }
    return acc;
  }, {});

  res.status(200).json({
    all_env_keys: Object.keys(process.env).sort(),
    relevant_vars: env,
    mongodb_uri_status: process.env.MONGODB_URI ? 'DEFINED' : 'UNDEFINED'
  });
}
