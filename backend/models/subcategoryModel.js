const db = require('../config/database');

const createSubcategory = (subcategoryData, callback) => {
  const { name, categoryId } = subcategoryData;
  db.query('INSERT INTO Subcategories (name, category_id) VALUES (?, ?)', [name, categoryId], callback);
};

const deleteSubcategory = (subcategoryId, callback) => {
  db.query('DELETE FROM Subcategories WHERE id = ?', [subcategoryId], callback);
};

const getSubcategoriesByCategoryId = (categoryId, callback) => {
  db.query('SELECT * FROM Subcategories WHERE category_id = ?', [categoryId], callback);
};

const getAllSubcategories = (callback) => {
  db.query('SELECT * FROM Subcategories', callback);
};

const getSubcategoryById = (id, callback) => {
  db.query('SELECT * FROM Subcategories WHERE id = ?', [id], callback);
};



module.exports = {
  createSubcategory,
  deleteSubcategory,
  getSubcategoriesByCategoryId,
  getAllSubcategories,
  getSubcategoryById
};