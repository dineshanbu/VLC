const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Public route: Contact form submission from main landing page
router.post('/', contactController.submitContactInquiry);

// Admin protected routes: Inquiries inbox
router.get('/', verifyToken, contactController.getAllInquiries);
router.get('/:id', verifyToken, contactController.getInquiryById);
router.put('/:id', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), contactController.updateInquiry);
router.delete('/:id', verifyToken, requireRole('Super Admin', 'Admin'), contactController.deleteInquiry);

module.exports = router;
