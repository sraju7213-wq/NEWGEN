const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

const router = express.Router();

router.post('/generate', authMiddleware, aiController.generatePrompt);
router.post('/chat', authMiddleware, aiController.chat);
router.post('/batch', authMiddleware, aiController.batchGenerate);
router.post('/speech-to-text', authMiddleware, aiController.speechToText);

module.exports = router;
