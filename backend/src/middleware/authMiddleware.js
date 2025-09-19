const { verifyToken } = require('../utils/auth');
const db = require('../config/database');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ')
    ? header.replace('Bearer ', '')
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing' });
  }

  try {
    const decoded = verifyToken(token);
    const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token', detail: error.message });
  }
}

module.exports = authMiddleware;
