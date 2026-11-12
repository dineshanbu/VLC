const express = require('express');
const router = express.Router();
const controller = require('../controllers/executiveTeamController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/content', controller.getContent);
router.put('/content/hero', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'image_ar', maxCount: 1 }
]), controller.saveHero);
router.put('/content/page', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), controller.savePage);
router.get('/members', controller.getMembers);
router.get('/members/:id', controller.getMember);
router.post('/members/reorder', verifyToken, requireRole('Super Admin', 'Admin'), controller.reorderMembers);
router.post('/members', verifyToken, requireRole('Super Admin', 'Admin'), upload.single('image'), controller.createMember);
router.put('/members/:id', verifyToken, requireRole('Super Admin', 'Admin'), upload.single('image'), controller.updateMember);
router.delete('/members/:id', verifyToken, requireRole('Super Admin', 'Admin'), controller.deleteMember);

module.exports = router;
