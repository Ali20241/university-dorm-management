const express = require('express');
const router = express.Router();
const { getAllApplications, submitApplication, approveApplication, rejectApplication } = require('../controllers/applicationController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, verifyAdmin, getAllApplications);
router.post('/', verifyToken, submitApplication);
router.put('/:id/approve', verifyToken, verifyAdmin, approveApplication);
router.put('/:id/reject', verifyToken, verifyAdmin, rejectApplication);

module.exports = router;