const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public endpoints
router.get('/settings', newsController.getPageSettings);
router.get('/', newsController.getAllNews);
router.get('/:slugOrId', newsController.getNewsBySlugOrId);

// Admin protected endpoints
router.post('/inline-image', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.single('imageFile'), newsController.uploadInlineImage);
router.post('/translate-to-arabic', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), newsController.translateNewsToArabic);
router.put('/settings', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.fields([
  { name: 'hero_image', maxCount: 1 },
  { name: 'hero_image_ar', maxCount: 1 }
]), newsController.updatePageSettings);
router.post('/', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.single('imageFile'), newsController.createNews);
router.put('/:id', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.single('imageFile'), newsController.updateNews);
router.delete('/:id', verifyToken, requireRole('Super Admin', 'Admin'), newsController.deleteNews);

module.exports = router;
