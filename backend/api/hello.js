export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Crowd Solve API is working! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: 'production',
    endpoints: {
      test: '/test',
      api: '/api',
      health: '/health'
    }
  });
}