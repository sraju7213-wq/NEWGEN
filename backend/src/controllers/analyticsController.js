const db = require('../config/database');

function getOverview(req, res) {
  const promptStats = db
    .prepare(
      `SELECT status, COUNT(*) as count FROM prompts WHERE user_id = ? GROUP BY status`
    )
    .all(req.user.id);

  const activityCounts = db
    .prepare(
      `SELECT event_type, COUNT(*) as count FROM activities WHERE user_id = ? GROUP BY event_type`
    )
    .all(req.user.id);

  const suggestionsCount = db
    .prepare(
      `SELECT COUNT(*) as count FROM suggestions WHERE prompt_id IN (SELECT id FROM prompts WHERE user_id = ?)`
    )
    .get(req.user.id).count;

  return res.json({ promptStats, activityCounts, suggestionsCount });
}

module.exports = {
  getOverview
};
