const express = require('express');
const router = express.Router();
const subcategoriesController = require('../controllers/subcategoriesController');

// Route to get all subcategories
router.get('/', subcategoriesController.getAllSubcategories);

// Route to create a new subcategory
router.post('/', subcategoriesController.createSubcategory);

// Route to delete a subcategory
router.delete('/:id', subcategoriesController.deleteSubcategory);

module.exports = router;
