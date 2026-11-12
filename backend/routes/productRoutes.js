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
router.put('/settings', verifyToken, requireRole('Super Admin', 'Admin', 'Editor'), upload.fields([
  { name: 'hero_image', maxCount: 1 },
  { name: 'hero_image_ar', maxCount: 1 },
  { name: 'pipeline_image', maxCount: 1 },
  { name: 'pipeline_video', maxCount: 1 },
  { name: 'csl_intro_video', maxCount: 1 },
  { name: 'csl_about_video', maxCount: 1 },
  { name: 'csl_logo', maxCount: 1 }
]), productController.updatePageSettings);

// Reset / Seed Defaults
router.post('/seed', verifyToken, requireRole('Super Admin', 'Admin'), productController.seedProducts);

// Reorder Products
router.post('/reorder', verifyToken, requireRole('Super Admin', 'Admin'), productController.reorderProducts);

// Product CRUD
router.post('/', verifyToken, requireRole('Super Admin', 'Admin'), upload.any(), productController.createProduct);
router.put('/:id', verifyToken, requireRole('Super Admin', 'Admin'), upload.any(), productController.updateProduct);
router.delete('/:id', verifyToken, requireRole('Super Admin', 'Admin'), productController.deleteProduct);

module.exports = router;
