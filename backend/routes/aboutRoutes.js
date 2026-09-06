const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/content', aboutController.getAboutContent);
router.get('/leaders', aboutController.getAllLeaders);
router.get('/leaders/:id', aboutController.getLeaderById);

// ==========================================
// ADMIN PROTECTED ROUTES
// ==========================================

// Content Sections (Hero, Overview modal, Vision/Mission, Vision 2030)
router.put('/content/:section_key', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.single('image'), aboutController.updateAboutSection);

// Reset / Seed Defaults
router.post('/seed', verifyToken, requireRole('Super Admin', 'Admin'), aboutController.seedAbout);

// Reorder Leaders
router.post('/leaders/reorder', verifyToken, requireRole('Super Admin', 'Admin'), aboutController.reorderLeaders);

// Leaders CRUD
router.post('/leaders', verifyToken, requireRole('Super Admin', 'Admin'), upload.single('image'), aboutController.createLeader);
router.put('/leaders/:id', verifyToken, requireRole('Super Admin', 'Admin'), upload.single('image'), aboutController.updateLeader);
router.delete('/leaders/:id', verifyToken, requireRole('Super Admin', 'Admin'), aboutController.deleteLeader);

module.exports = router;
