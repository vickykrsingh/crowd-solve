export default function handler(req, res) {
  res.status(200).json({
    message: 'Test endpoint is working!',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
}