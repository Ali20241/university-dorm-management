const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, verifyAdmin, getDashboardStats);

module.exports = router;