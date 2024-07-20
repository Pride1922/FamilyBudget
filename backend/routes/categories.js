const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRoles(['admin']), categoriesController.createCategory);
router.get('/', categoriesController.getAllCategories);
router.put('/:id', authenticateToken, authorizeRoles(['admin']), categoriesController.updateCategory);
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), categoriesController.deleteCategory);

module.exports = router;
