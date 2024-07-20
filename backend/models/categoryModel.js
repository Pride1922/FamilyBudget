const db = require('../config/database');

const createCategory = (categoryData, callback) => {
  const { name, type } = categoryData;
  db.query('INSERT INTO Categories (name, type) VALUES (?, ?)', [name, type], callback);
};

const getAllCategories = (callback) => {
  db.query('SELECT * FROM Categories', callback);
};

const updateCategory = (categoryId, categoryData, callback) => {
  const { name, type } = categoryData;
  db.query('UPDATE Categories SET name = ?, type = ? WHERE id = ?', [name, type, categoryId], callback);
};

const deleteCategory = (categoryId, callback) => {
  db.query('DELETE FROM Categories WHERE id = ?', [categoryId], callback);
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
};
