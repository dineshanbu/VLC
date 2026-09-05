const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/auth');

// All user management routes require valid token
router.use(verifyToken);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', requireRole('Super Admin', 'Admin'), userController.createUser);
router.put('/:id', requireRole('Super Admin', 'Admin'), userController.updateUser);
router.delete('/:id', requireRole('Super Admin'), userController.deleteUser);

module.exports = router;
