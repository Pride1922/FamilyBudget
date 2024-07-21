const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoriesController');
const { authenticateToken } = require('../middleware/auth'); 

router.get('/', authenticateToken, categoryController.getCategories);
router.get('/:id', authenticateToken, categoryController.getCategoryById);
router.post('/', authenticateToken, categoryController.addCategory);
router.put('/:id', authenticateToken, categoryController.editCategory);
router.delete('/:id', authenticateToken, categoryController.deleteCategory);

module.exports = router;