const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/overview', authMiddleware, analyticsController.getOverview);

module.exports = router;
