const db = require('../config/database');

// Function to get all merchants
const getAllMerchants = (callback) => {
  if (typeof callback !== 'function') {
    throw new Error('Callback is not a function');
  }

  db.query('SELECT * FROM Merchants', (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
};

// Function to get a merchant by ID
const getMerchantById = (id, callback) => {
  if (typeof callback !== 'function') {
    throw new Error('Callback is not a function');
  }

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

  if (typeof callback !== 'function') {
    throw new Error('Callback is not a function');
  }

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

  if (typeof callback !== 'function') {
    throw new Error('Callback is not a function');
  }

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
  if (typeof callback !== 'function') {
    throw new Error('Callback is not a function');
  }

  db.query('DELETE FROM Merchants WHERE id = ?', [id], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results.affectedRows > 0);
  });
};

// Function to get merchants by category ID
const getMerchantsByCategoryId = (categoryId, callback) => {
  if (typeof callback !== 'function') {
    throw new Error('Callback is not a function');
  }

  db.query('SELECT * FROM Merchants WHERE category_id = ?', [categoryId], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
};

// Function to get merchants by subcategory ID
const getMerchantsBySubcategoryId = (subcategoryId, callback) => {
  if (typeof callback !== 'function') {
    throw new Error('Callback is not a function');
  }

  db.query('SELECT COUNT(*) AS count FROM Merchants WHERE subcategory_id = ?', [subcategoryId], (err, results) => {
    if (err) {
      return callback(err, null);
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
