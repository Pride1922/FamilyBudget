const db = require('../config/database');

// Function to get all bank accounts
const getAllBankAccounts = (callback) => {
  db.query('SELECT * FROM BankAccounts', (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
};

// Function to get a bank account by ID
const getBankAccountById = (id, callback) => {
  db.query('SELECT * FROM BankAccounts WHERE id = ?', [id], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results[0]);
  });
};

// Function to create a new bank account
const createBankAccount = (bankAccount, callback) => {
  const { accountHolder, iban, bic, bankName, accountType, balance, currency } = bankAccount;
  db.query(
    'INSERT INTO BankAccounts (accountHolder, iban, bic, bankName, accountType, balance, currency) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [accountHolder, iban, bic, bankName, accountType, balance, currency],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id: results.insertId, ...bankAccount });
    }
  );
};

// Function to update an existing bank account
const updateBankAccount = (id, bankAccount, callback) => {
  const { accountHolder, iban, bic, bankName, accountType, balance, currency } = bankAccount;
  db.query(
    'UPDATE BankAccounts SET accountHolder = ?, iban = ?, bic = ?, bankName = ?, accountType = ?, balance = ?, currency = ? WHERE id = ?',
    [accountHolder, iban, bic, bankName, accountType, balance, currency, id],
    (err, results) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, { id, ...bankAccount });
    }
  );
};

// Function to delete a bank account
const deleteBankAccount = (id, callback) => {
  db.query('DELETE FROM BankAccounts WHERE id = ?', [id], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results.affectedRows > 0);
  });
};

module.exports = {
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount
};
