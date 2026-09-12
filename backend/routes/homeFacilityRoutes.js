const express = require('express');
const router = express.Router();
const controller = require('../controllers/homeFacilityController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', controller.getImages);
router.get('/manage', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), controller.getAllImages);
router.post('/', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.facilityUpload.single('image'), controller.createImage);
router.put('/:id', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.facilityUpload.single('image'), controller.updateImage);
router.post('/reorder', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), controller.reorderImages);
router.delete('/:id', verifyToken, requireRole('Super Admin', 'Admin'), controller.deleteImage);

module.exports = router;
