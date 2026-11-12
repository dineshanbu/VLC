const express = require('express');
const router = express.Router();
const controller = require('../controllers/brandingController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/logos', controller.getLogos);
router.get('/footer', controller.getFooterSettings);
router.put('/footer', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), controller.updateFooterSettings);
router.put('/logos', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.fields([
  { name: 'header_logo', maxCount: 1 },
  { name: 'footer_logo', maxCount: 1 },
  { name: 'home_banner_logo', maxCount: 1 }
]), controller.updateLogos);

module.exports = router;
