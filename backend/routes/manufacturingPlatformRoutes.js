const express = require('express');
const router = express.Router();
const controller = require('../controllers/manufacturingPlatformController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const imageFields = [
  { name: 'hero_image', maxCount: 1 },
  { name: 'hero_image_ar', maxCount: 1 },
  { name: 'overview_image', maxCount: 1 },
  ...Array.from({ length: 6 }, (_, index) => ({ name: `journey_image_${index}`, maxCount: 1 })),
  ...Array.from({ length: 3 }, (_, index) => ({ name: `growth_image_${index}`, maxCount: 1 }))
];

router.get('/content', controller.getContent);
router.put('/content', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.fields(imageFields), controller.saveContent);

module.exports = router;
