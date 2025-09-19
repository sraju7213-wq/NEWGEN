const express = require('express');
const multer = require('multer');
const path = require('path');
const promptController = require('../controllers/promptController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(__dirname, '..', '..', 'uploads'));
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.use(authMiddleware);

router.get('/', promptController.getPrompts);
router.post('/', promptController.createPrompt);
router.put('/:id', promptController.updatePrompt);
router.delete('/:id', promptController.deletePrompt);
router.post('/:id/suggestions', promptController.generateSuggestions);
router.post('/images/upload', upload.single('image'), promptController.attachImageMetadata);

module.exports = router;
