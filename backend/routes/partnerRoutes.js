const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/settings', partnerController.getPageSettings);
router.get('/sections', partnerController.getSections);
router.get('/', partnerController.getAllPartners);
router.post('/inquiries', partnerController.submitInquiry);

// ==========================================
// ADMIN PROTECTED ROUTES
// ==========================================

// Page Banner & Hero Settings
router.put('/settings', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.single('hero_image'), partnerController.updatePageSettings);

// Reset / Seed Defaults
router.post('/seed', verifyToken, requireRole('Super Admin', 'Admin'), partnerController.seedPartners);

// Reorder Partners
router.post('/reorder', verifyToken, requireRole('Super Admin', 'Admin'), partnerController.reorderPartners);

// Inquiries Management
router.get('/inquiries/all', verifyToken, requireRole('Super Admin', 'Admin'), partnerController.getInquiries);
router.put('/inquiries/:id/status', verifyToken, requireRole('Super Admin', 'Admin'), partnerController.updateInquiryStatus);
router.delete('/inquiries/:id', verifyToken, requireRole('Super Admin', 'Admin'), partnerController.deleteInquiry);

// Dynamic Sections Management
router.post('/sections', verifyToken, requireRole('Super Admin', 'Admin'), upload.single('image'), partnerController.createSection);
router.put('/sections/:id', verifyToken, requireRole('Super Admin', 'Admin'), upload.single('image'), partnerController.updateSection);
router.delete('/sections/:id', verifyToken, requireRole('Super Admin', 'Admin'), partnerController.deleteSection);

// Strategic Partners CRUD
router.get('/:id', partnerController.getPartnerById);
router.post('/', verifyToken, requireRole('Super Admin', 'Admin'), upload.single('logo'), partnerController.createPartner);
router.put('/:id', verifyToken, requireRole('Super Admin', 'Admin'), upload.single('logo'), partnerController.updatePartner);
router.delete('/:id', verifyToken, requireRole('Super Admin', 'Admin'), partnerController.deletePartner);

module.exports = router;
