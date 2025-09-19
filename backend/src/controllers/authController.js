const db = require('../config/database');
const { hashPassword, verifyPassword, createToken } = require('../utils/auth');
const { logActivity } = require('../utils/activityLogger');

function register(req, res) {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const hashedPassword = hashPassword(password);
  const result = db
    .prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)')
    .run(email.toLowerCase(), hashedPassword, name || null);

  const user = { id: result.lastInsertRowid, email: email.toLowerCase(), name: name || null };
  const token = createToken(user);
  logActivity(user.id, 'user.register', { email: user.email });

  return res.status(201).json({ user, token });
}

function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!verifyPassword(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = createToken(user);
  const safeUser = { id: user.id, email: user.email, name: user.name };
  logActivity(user.id, 'user.login', {});
  return res.json({ user: safeUser, token });
}

function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  me
};
