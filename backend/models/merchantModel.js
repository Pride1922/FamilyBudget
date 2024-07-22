const db = require('../config/database');

// Function to get all merchants
const getAllMerchants = (callback) => {
  db.query('SELECT * FROM Merchants', (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
};

// Function to get a merchant by ID
const getMerchantById = (id, callback) => {
  db.query('SELECT * FROM Merchants WHERE id = ?', [id], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results[0]);
  });
};

// Function to create a new merchant
const createMerchant = (merchant, callback) => {
  const { name, category_id, subcategory_id, address, phone, email, website } = merchant;
  db.query(
    'INSERT INTO Merchants (name, category_id, subcategory_id, address, phone, email, website) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, category_id, subcategory_id, address, phone, email, website],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id: results.insertId, ...merchant });
    }
  );
};

// Function to update a merchant
const updateMerchant = (id, merchant, callback) => {
  const { name, category_id, subcategory_id, address, phone, email, website } = merchant;
  db.query(
    'UPDATE Merchants SET name = ?, category_id = ?, subcategory_id = ?, address = ?, phone = ?, email = ?, website = ? WHERE id = ?',
    [name, category_id, subcategory_id, address, phone, email, website, id],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, ...merchant });
    }
  );
};

// Function to delete a merchant
const deleteMerchant = (id, callback) => {
  db.query('DELETE FROM Merchants WHERE id = ?', [id], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results.affectedRows > 0);
  });
};

const getMerchantsByCategoryId = (categoryId, callback) => {
  db.query('SELECT * FROM Merchants WHERE category_id = ?', [categoryId], callback);
};

const getMerchantsBySubcategoryId = (subcategoryId, callback) => {
  db.query('SELECT COUNT(*) AS count FROM Merchants WHERE subcategory_id = ?', [subcategoryId], (err, results) => {
      if (err) {
          return callback(err);
      }
      callback(null, results[0].count > 0);
  });
};


module.exports = {
  getAllMerchants,
  getMerchantById,
  createMerchant,
  updateMerchant,
  deleteMerchant,
  getMerchantsByCategoryId,
  getMerchantsBySubcategoryId
};
