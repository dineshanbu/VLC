const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public endpoints
router.get('/', newsController.getAllNews);
router.get('/:slugOrId', newsController.getNewsBySlugOrId);

// Admin protected endpoints
router.post('/', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.single('imageFile'), newsController.createNews);
router.put('/:id', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.single('imageFile'), newsController.updateNews);
router.delete('/:id', verifyToken, requireRole('Super Admin', 'Admin'), newsController.deleteNews);

module.exports = router;
