const express = require('express');
const router = express.Router();
const { getAllStudents, getStudentById } = require('../controllers/studentController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, verifyAdmin, getAllStudents);
router.get('/:id', verifyToken, getStudentById);

module.exports = router;