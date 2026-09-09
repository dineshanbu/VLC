const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get('/', productController.getAllProducts);
router.get('/settings', productController.getPageSettings);
router.get('/:id', productController.getProductById);

// ==========================================
// ADMIN PROTECTED ROUTES
// ==========================================

// Page Settings (Hero & CTA)
router.put('/settings', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.single('hero_image'), productController.updatePageSettings);

// Reset / Seed Defaults
router.post('/seed', verifyToken, requireRole('Super Admin', 'Admin'), productController.seedProducts);

// Reorder Products
router.post('/reorder', verifyToken, requireRole('Super Admin', 'Admin'), productController.reorderProducts);

// Product CRUD
router.post('/', verifyToken, requireRole('Super Admin', 'Admin'), upload.any(), productController.createProduct);
router.put('/:id', verifyToken, requireRole('Super Admin', 'Admin'), upload.any(), productController.updateProduct);
router.delete('/:id', verifyToken, requireRole('Super Admin', 'Admin'), productController.deleteProduct);

module.exports = router;
