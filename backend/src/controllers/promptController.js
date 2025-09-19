const db = require('../config/database');
const { refinePrompt } = require('../services/geminiClient');
const { logActivity } = require('../utils/activityLogger');

function getPrompts(req, res) {
  const prompts = db
    .prepare(
      `SELECT p.*, (
        SELECT json_group_array(json_object('id', s.id, 'suggestion_text', s.suggestion_text, 'created_at', s.created_at))
        FROM suggestions s WHERE s.prompt_id = p.id
      ) as suggestions
      FROM prompts p
      WHERE p.user_id = ?
      ORDER BY p.updated_at DESC`
    )
    .all(req.user.id)
    .map((prompt) => ({
      ...prompt,
      metadata: prompt.metadata ? JSON.parse(prompt.metadata) : {},
      suggestions: prompt.suggestions ? JSON.parse(prompt.suggestions) : []
    }));

  return res.json({ prompts });
}

function createPrompt(req, res) {
  const { title, content, status = 'draft', metadata = {} } = req.body;
  if (!content) {
    return res.status(400).json({ message: 'Prompt content is required' });
  }

  const result = db
    .prepare(
      `INSERT INTO prompts (user_id, title, content, status, metadata) VALUES (?, ?, ?, ?, ?)`
    )
    .run(req.user.id, title || null, content, status, JSON.stringify(metadata));

  const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(result.lastInsertRowid);
  prompt.metadata = prompt.metadata ? JSON.parse(prompt.metadata) : {};
  logActivity(req.user.id, 'prompt.create', { promptId: prompt.id });

  return res.status(201).json({ prompt });
}

function updatePrompt(req, res) {
  const { id } = req.params;
  const { title, content, status, metadata = {} } = req.body;
  const existing = db.prepare('SELECT * FROM prompts WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!existing) {
    return res.status(404).json({ message: 'Prompt not found' });
  }

  db.prepare(
    `UPDATE prompts SET title = ?, content = ?, status = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).run(title || null, content || existing.content, status || existing.status, JSON.stringify(metadata), id);

  const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(id);
  prompt.metadata = prompt.metadata ? JSON.parse(prompt.metadata) : {};
  logActivity(req.user.id, 'prompt.update', { promptId: prompt.id });
  return res.json({ prompt });
}

function deletePrompt(req, res) {
  const { id } = req.params;
  const existing = db.prepare('SELECT id FROM prompts WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!existing) {
    return res.status(404).json({ message: 'Prompt not found' });
  }

  db.prepare('DELETE FROM prompts WHERE id = ?').run(id);
  logActivity(req.user.id, 'prompt.delete', { promptId: id });
  return res.json({ success: true });
}

async function generateSuggestions(req, res, next) {
  const { id } = req.params;
  const prompt = db.prepare('SELECT * FROM prompts WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!prompt) {
    return res.status(404).json({ message: 'Prompt not found' });
  }

  try {
    const result = await refinePrompt(prompt.content);
    const suggestionText = result.text || 'No suggestions generated';
    const insert = db
      .prepare('INSERT INTO suggestions (prompt_id, suggestion_text, model) VALUES (?, ?, ?)')
      .run(prompt.id, suggestionText, 'gemini');

    const suggestion = db.prepare('SELECT * FROM suggestions WHERE id = ?').get(insert.lastInsertRowid);
    logActivity(req.user.id, 'prompt.suggestion', { promptId: prompt.id });

    return res.json({ suggestion, raw: result.raw });
  } catch (error) {
    return next(error);
  }
}

function attachImageMetadata(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Image upload failed' });
  }

  const { promptId } = req.body;
  const fileRecord = db
    .prepare('INSERT INTO images (user_id, prompt_id, file_name, file_path) VALUES (?, ?, ?, ?)')
    .run(req.user.id, promptId || null, req.file.originalname, req.file.filename);

  logActivity(req.user.id, 'prompt.imageUpload', { promptId: promptId || null });
  const image = db.prepare('SELECT * FROM images WHERE id = ?').get(fileRecord.lastInsertRowid);
  return res.status(201).json({ image });
}

module.exports = {
  getPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  generateSuggestions,
  attachImageMetadata
};
