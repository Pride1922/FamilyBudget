const db = require('../models/categoryModel');
const { errorLogger, infoLogger } = require('../config/logger');
const subcategoryModel = require('../models/subcategoryModel');

const createCategory = (req, res) => {
  const categoryData = req.body;
  db.createCategory(categoryData, (error, results) => {
    if (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        errorLogger.error('Duplicate entry error:', { error });
        return res.status(400).send({ message: 'Category name already exists' });
      }
      errorLogger.error('Database error:', { error });
      return res.status(500).send({ message: 'Database error', error });
    }
    infoLogger.info('Category added successfully');
    res.status(201).send({ message: 'Category added successfully' });
  });
};

const getAllCategories = (req, res) => {
  db.getAllCategories(async (error, categories) => {
    if (error) {
      errorLogger.error('Database error:', { error });
      return res.status(500).send({ message: 'Database error', error });
    }

    try {
      for (const category of categories) {
        const subcategories = await new Promise((resolve, reject) => {
          subcategoryModel.getSubcategoriesByCategoryId(category.id, (error, subcategories) => {
            if (error) reject(error);
            else resolve(subcategories);
          });
        });
        category.subcategories = subcategories;
      }
      res.status(200).send(categories);
    } catch (err) {
      errorLogger.error('Error fetching subcategories:', { err });
      res.status(500).send({ message: 'Error fetching subcategories', error: err });
    }
  });
};

const updateCategory = (req, res) => {
  const { id } = req.params;
  const categoryData = req.body;
  db.updateCategory(id, categoryData, (error, results) => {
    if (error) {
      errorLogger.error('Database error:', { error });
      return res.status(500).send({ message: 'Database error', error });
    }
    if (results.affectedRows === 0) {
      return res.status(404).send({ message: `No category found with ID ${id}` });
    }
    infoLogger.info(`Category with ID ${id} updated successfully`);
    res.status(200).send({ message: `Category with ID ${id} updated successfully` });
  });
};

const deleteCategory = (req, res) => {
  const { id } = req.params;
  db.deleteCategory(id, async (error, results) => {
    if (error) {
      errorLogger.error('Database error:', { error });
      return res.status(500).send({ message: 'Database error', error });
    }
    if (results.affectedRows === 0) {
      return res.status(404).send({ message: `No category found with ID ${id}` });
    }

    await new Promise((resolve, reject) => {
      subcategoryModel.deleteSubcategoriesByCategoryId(id, (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });

    infoLogger.info(`Category with ID ${id} deleted successfully`);
    res.status(200).send({ message: `Category with ID ${id} deleted successfully` });
  });
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
};
