const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Public route: view open positions
router.get('/', careerController.getAllJobs);

// Admin routes: manage positions
router.post('/', verifyToken, requireRole('Super Admin', 'Admin'), careerController.createJob);
router.put('/:id', verifyToken, requireRole('Super Admin', 'Admin'), careerController.updateJob);
router.delete('/:id', verifyToken, requireRole('Super Admin', 'Admin'), careerController.deleteJob);

module.exports = router;
