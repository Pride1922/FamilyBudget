const db = require('../models/categoryModel');
const { errorLogger, infoLogger } = require('../config/logger');
const subcategoryModel = require('../models/subcategoryModel');

// Create a new category
const createCategory = (req, res) => {
  const categoryData = req.body;
  db.createCategory(categoryData, (error, results) => {
    if (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        errorLogger.error('Duplicate entry error while creating category:', {
          message: 'Category name already exists',
          error: error.message,
          stack: error.stack
        });
        return res.status(400).send({ message: 'Category name already exists' });
      }
      errorLogger.error('Database error while creating category:', {
        error: error.message,
        stack: error.stack
      });
      return res.status(500).send({ message: 'Database error', error: error.message });
    }
    infoLogger.info('Category added successfully:', { categoryData });
    res.status(201).send({ message: 'Category added successfully' });
  });
};

// Get all categories with their subcategories
const getAllCategories = (req, res) => {
  db.getAllCategories(async (error, categories) => {
    if (error) {
      errorLogger.error('Database error while fetching categories:', {
        error: error.message,
        stack: error.stack
      });
      return res.status(500).send({ message: 'Database error', error: error.message });
    }

    try {
      for (const category of categories) {
        const subcategories = await new Promise((resolve, reject) => {
          subcategoryModel.getSubcategoriesByCategoryId(category.id, (error, subcategories) => {
            if (error) {
              reject(error);
            } else {
              resolve(subcategories);
            }
          });
        });
        category.subcategories = subcategories;
      }
      infoLogger.info('Categories with subcategories fetched successfully');
      res.status(200).send(categories);
    } catch (err) {
      errorLogger.error('Error fetching subcategories for categories:', {
        error: err.message,
        stack: err.stack
      });
      res.status(500).send({ message: 'Error fetching subcategories', error: err.message });
    }
  });
};

// Update a category
const updateCategory = (req, res) => {
  const { id } = req.params;
  const categoryData = req.body;
  db.updateCategory(id, categoryData, (error, results) => {
    if (error) {
      errorLogger.error('Database error while updating category:', {
        message: 'Error executing query to update category',
        query: 'UPDATE Categories SET ? WHERE id = ?',
        params: [categoryData, id],
        error: error.message,
        stack: error.stack
      });
      return res.status(500).send({ message: 'Database error', error: error.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).send({ message: `No category found with ID ${id}` });
    }
    infoLogger.info(`Category with ID ${id} updated successfully`, { categoryData });
    res.status(200).send({ message: `Category with ID ${id} updated successfully` });
  });
};

// Delete a category
const deleteCategory = (req, res) => {
  const { id } = req.params;
  db.deleteCategory(id, async (error, results) => {
    if (error) {
      errorLogger.error('Database error while deleting category:', {
        message: 'Error executing query to delete category',
        query: 'DELETE FROM Categories WHERE id = ?',
        params: [id],
        error: error.message,
        stack: error.stack
      });
      return res.status(500).send({ message: 'Database error', error: error.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).send({ message: `No category found with ID ${id}` });
    }

    try {
      await new Promise((resolve, reject) => {
        subcategoryModel.deleteSubcategoriesByCategoryId(id, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
      infoLogger.info(`Category with ID ${id} deleted successfully`);
      res.status(200).send({ message: `Category with ID ${id} deleted successfully` });
    } catch (err) {
      errorLogger.error('Error deleting subcategories for category ID:', {
        categoryId: id,
        error: err.message,
        stack: err.stack
      });
      res.status(500).send({ message: 'Error deleting subcategories', error: err.message });
    }
  });
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
};
