const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public or Admin viewing media assets
router.get('/', mediaController.getAllMedia);

// Admin file uploads
router.post('/upload', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.single('file'), mediaController.uploadMedia);
router.delete('/:id', verifyToken, requireRole('Super Admin', 'Admin'), mediaController.deleteMedia);

module.exports = router;
