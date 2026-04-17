const express = require('express');
const router = express.Router();
const { getAllRooms, getRoomById } = require('../controllers/roomController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', getAllRooms);
router.get('/:id', getRoomById);

module.exports = router;