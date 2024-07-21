const db = require('../models/subcategoryModel');
const { errorLogger, infoLogger } = require('../config/logger');

// Function to get all subcategories
const getAllSubcategories = (req, res) => {
  db.getAllSubcategories((error, subcategories) => {
    if (error) {
      errorLogger.error('Database error while retrieving all subcategories:', {
        error: error.message,
        stack: error.stack,
        query: 'SELECT * FROM Subcategories' // Adjust this if you have a specific query
      });
      return res.status(500).send({ message: 'Database error', error: error.message });
    }
    infoLogger.info('Retrieved all subcategories successfully');
    res.status(200).send(subcategories);
  });
};

// Function to create a new subcategory
const createSubcategory = (req, res) => {
  const { categoryId } = req.params;
  const subcategoryData = { ...req.body, categoryId };

  db.createSubcategory(subcategoryData, (error, results) => {
    if (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        errorLogger.error('Duplicate entry error while creating subcategory:', {
          error: error.message,
          stack: error.stack,
          query: 'INSERT INTO Subcategories ...', // Adjust this if you have a specific query
          params: subcategoryData
        });
        return res.status(400).send({ message: 'Subcategory name already exists for this category' });
      }
      errorLogger.error('Database error while creating subcategory:', {
        error: error.message,
        stack: error.stack,
        query: 'INSERT INTO Subcategories ...', // Adjust this if you have a specific query
        params: subcategoryData
      });
      return res.status(500).send({ message: 'Database error', error: error.message });
    }
    infoLogger.info('Subcategory added successfully:', {
      subcategory: subcategoryData,
      results
    });
    res.status(201).send({ message: 'Subcategory added successfully' });
  });
};

// Function to delete a subcategory
const deleteSubcategory = (req, res) => {
  const { id } = req.params;

  db.deleteSubcategory(id, (error, results) => {
    if (error) {
      errorLogger.error('Database error while deleting subcategory:', {
        error: error.message,
        stack: error.stack,
        query: 'DELETE FROM Subcategories WHERE id = ?', // Adjust this if you have a specific query
        params: [id]
      });
      return res.status(500).send({ message: 'Database error', error: error.message });
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
