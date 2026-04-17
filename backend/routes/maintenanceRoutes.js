const express = require('express');
const router = express.Router();
const { getAllRequests, submitRequest, updateRequestStatus } = require('../controllers/maintenanceController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, verifyAdmin, getAllRequests);
router.post('/', verifyToken, submitRequest);
router.put('/:id/status', verifyToken, verifyAdmin, updateRequestStatus);

module.exports = router;