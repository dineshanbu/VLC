const router = require('express').Router();
const controller = require('../controllers/pharmacovigilanceController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
router.get('/settings', controller.getPageSettings);
router.post('/', controller.submitReport);
router.get('/', verifyToken, controller.getReports);
router.put('/settings', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.fields([
  { name: 'hero_image', maxCount: 1 },
  { name: 'hero_image_ar', maxCount: 1 }
]), controller.updatePageSettings);
router.put('/:id', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), controller.updateReport);
router.delete('/:id', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), controller.deleteReport);
module.exports = router;
