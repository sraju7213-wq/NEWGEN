const db = require('../config/database');

function logActivity(userId, eventType, payload = {}) {
  db.prepare(
    `INSERT INTO activities (user_id, event_type, payload) VALUES (?, ?, ?)`
  ).run(userId || null, eventType, JSON.stringify(payload));
}

module.exports = { logActivity };
