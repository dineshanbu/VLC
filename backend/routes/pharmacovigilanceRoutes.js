const router = require('express').Router();
const controller = require('../controllers/pharmacovigilanceController');
const { verifyToken, requireRole } = require('../middleware/auth');
router.post('/', controller.submitReport);
router.get('/', verifyToken, controller.getReports);
router.put('/:id', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), controller.updateReport);
module.exports = router;
