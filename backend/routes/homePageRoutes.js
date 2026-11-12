const express = require('express');
const router = express.Router();
const controller = require('../controllers/homePageController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/content', controller.getContent);
router.put('/corporate-video', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.single('corporate_video'), controller.updateCorporateVideo);
router.put('/content/:section_key', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'image_ar', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'card_image_0', maxCount: 1 },
  { name: 'card_image_1', maxCount: 1 },
  { name: 'card_image_2', maxCount: 1 }
]), controller.updateSection);

module.exports = router;
