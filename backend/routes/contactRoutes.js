const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route: Contact form submission from main landing page
router.post('/', contactController.submitContactInquiry);

// Public Contact page content and protected admin editor.
router.get('/settings', contactController.getPageSettings);
router.put('/settings', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.fields([
  { name: 'hero_image', maxCount: 1 },
  { name: 'hero_image_ar', maxCount: 1 },
  { name: 'office_image', maxCount: 1 },
  { name: 'facility_image', maxCount: 1 }
]), contactController.updatePageSettings);

// Admin protected routes: Inquiries inbox
router.get('/', verifyToken, contactController.getAllInquiries);
router.get('/:id', verifyToken, contactController.getInquiryById);
router.put('/:id', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), contactController.updateInquiry);
router.delete('/:id', verifyToken, requireRole('Super Admin', 'Admin'), contactController.deleteInquiry);

module.exports = router;
