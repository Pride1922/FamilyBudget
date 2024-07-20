const db = require('../models/subcategoryModel');
const { errorLogger, infoLogger } = require('../config/logger');

const getAllSubcategories = (req, res) => {
  db.getAllSubcategories((error, subcategories) => {
    if (error) {
      errorLogger.error('Database error:', { error });
      return res.status(500).send({ message: 'Database error', error });
    }
    res.status(200).send(subcategories);
  });
};

const createSubcategory = (req, res) => {
  const { categoryId } = req.params;
  const subcategoryData = { ...req.body, categoryId };

  db.createSubcategory(subcategoryData, (error, results) => {
    if (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        errorLogger.error('Duplicate entry error:', { error });
        return res.status(400).send({ message: 'Subcategory name already exists for this category' });
      }
      errorLogger.error('Database error:', { error });
      return res.status(500).send({ message: 'Database error', error });
    }
    infoLogger.info('Subcategory added successfully');
    res.status(201).send({ message: 'Subcategory added successfully' });
  });
};

const deleteSubcategory = (req, res) => {
  const { id } = req.params;

  db.deleteSubcategory(id, (error, results) => {
    if (error) {
      errorLogger.error('Database error:', { error });
      return res.status(500).send({ message: 'Database error', error });
    }
    if (results.affectedRows === 0) {
      return res.status(404).send({ message: `No subcategory found with ID ${id}` });
    }
    infoLogger.info(`Subcategory with ID ${id} deleted successfully`);
    res.status(200).send({ message: `Subcategory with ID ${id} deleted successfully` });
  });
};

module.exports = {
  getAllSubcategories,
  createSubcategory,
  deleteSubcategory
};
