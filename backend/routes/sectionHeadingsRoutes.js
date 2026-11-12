const express = require('express');
const router = express.Router();
const controller = require('../controllers/sectionHeadingsController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', controller.getHeadings);
router.put('/', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), controller.saveHeadings);

module.exports = router;
