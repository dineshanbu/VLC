const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/settings', careerController.getPageSettings);
router.get('/', careerController.getAllJobs);
router.get('/departments', careerController.getDepartments);
router.post('/apply', upload.single('resume'), careerController.applyJob);

// Admin routes: manage candidate applications
router.get('/applications', verifyToken, requireRole('Super Admin', 'Admin'), careerController.getApplications);
router.put('/applications/:id/status', verifyToken, requireRole('Super Admin', 'Admin'), careerController.updateApplicationStatus);

// Admin routes: seed/sync
router.post('/seed', verifyToken, requireRole('Super Admin', 'Admin'), careerController.seedJobs);

router.put('/settings', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.fields([
  { name: 'hero_image', maxCount: 1 },
  { name: 'hero_image_ar', maxCount: 1 },
  { name: 'life_image_1', maxCount: 1 },
  { name: 'life_image_2', maxCount: 1 },
  { name: 'life_image_3', maxCount: 1 },
  { name: 'life_image_4', maxCount: 1 }
]), careerController.updatePageSettings);

// Admin & Public route for specific job
router.get('/:id', careerController.getJobById);

// Admin routes: manage positions
router.post('/', verifyToken, requireRole('Super Admin', 'Admin'), careerController.createJob);
router.put('/:id', verifyToken, requireRole('Super Admin', 'Admin'), careerController.updateJob);
router.delete('/:id', verifyToken, requireRole('Super Admin', 'Admin'), careerController.deleteJob);

module.exports = router;

