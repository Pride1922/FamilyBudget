const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoriesController');
const { authenticateToken } = require('../middleware/auth'); 

router.get('/', authenticateToken,  subcategoryController.getSubcategories);
router.get('/:id', authenticateToken, subcategoryController.getSubcategoryById);
router.post('/', authenticateToken, subcategoryController.addSubcategory);
router.put('/:id', authenticateToken, subcategoryController.editSubcategory);
router.delete('/:id', authenticateToken, subcategoryController.deleteSubcategory);

router.get('/category/:categoryId', subcategoryController.getSubcategoriesByCategoryId);


module.exports = router;
