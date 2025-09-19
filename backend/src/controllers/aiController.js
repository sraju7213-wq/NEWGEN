const { generatePromptFromSeed, chatWithGemini, batchGeneratePrompts } = require('../services/geminiClient');
const { transcribeBase64Audio } = require('../services/speechService');
const { logActivity } = require('../utils/activityLogger');

async function generatePrompt(req, res, next) {
  const { seed, context } = req.body;
  if (!seed) {
    return res.status(400).json({ message: 'Seed text is required' });
  }

  try {
    const result = await generatePromptFromSeed(seed, context);
    logActivity(req.user?.id, 'ai.generatePrompt', { seed });
    return res.json({ prompt: result.text, raw: result.raw });
  } catch (error) {
    return next(error);
  }
}

async function chat(req, res, next) {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: 'Messages are required' });
  }

  try {
    const result = await chatWithGemini(messages);
    logActivity(req.user?.id, 'ai.chat', { messageCount: messages.length });
    return res.json({ response: result.text, raw: result.raw });
  } catch (error) {
    return next(error);
  }
}

async function batchGenerate(req, res, next) {
  const { theme, keywords, count, tone } = req.body;
  if (!theme) {
    return res.status(400).json({ message: 'Theme is required for batch generation' });
  }

  try {
    const result = await batchGeneratePrompts({ theme, keywords, count, tone });
    logActivity(req.user?.id, 'ai.batchGenerate', { theme, count });
    const prompts = result.text
      .split('\n')
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
    return res.json({ prompts, raw: result.raw });
  } catch (error) {
    return next(error);
  }
}

async function speechToText(req, res, next) {
  const { audioContent, config } = req.body;
  if (!audioContent) {
    return res.status(400).json({ message: 'audioContent is required' });
  }

  try {
    const transcript = await transcribeBase64Audio(audioContent, config);
    logActivity(req.user?.id, 'ai.speechToText', {});
    return res.json({ transcript });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  generatePrompt,
  chat,
  batchGenerate,
  speechToText
};
