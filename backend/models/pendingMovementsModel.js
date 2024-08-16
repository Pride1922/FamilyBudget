const db = require('../config/database');

// Create a new pending movement
const createPendingMovement = (movementData, callback) => {
  const {
    account_number,
    account_name,
    counterparty_account,
    transaction_number,
    booking_date,
    value_date,
    amount,
    currency,
    description,
    transaction_details,
    message,
    merchant_id,
    category_id,
    subcategory_id,
    is_income,
    status
  } = movementData;

  db.query(
    `INSERT INTO PendingMovements
    (account_number, account_name, counterparty_account, transaction_number, booking_date, value_date, amount, currency, description, transaction_details, message, merchant_id, category_id, subcategory_id, is_income, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      account_number,
      account_name,
      counterparty_account,
      transaction_number,
      booking_date,
      value_date,
      amount,
      currency,
      description,
      transaction_details,
      message,
      merchant_id,
      category_id,
      subcategory_id,
      is_income,
      status
    ],
    callback
  );
};

// Get all pending movements
const getAllPendingMovements = (callback) => {
  db.query('SELECT * FROM PendingMovements WHERE status = "pending"', callback);
};

// Get all unmatched pending movements (where merchant_id is null)
const getUnmatchedMovements = (callback) => {
  db.query('SELECT * FROM PendingMovements WHERE merchant_id IS NULL', callback);
};

// Update a pending movement with matched merchant, category, and subcategory
const updateMovementWithMerchant = (movementId, merchantData, callback) => {
  const {
    merchant_id,
    category_id,
    subcategory_id
  } = merchantData;

  db.query(
    'UPDATE PendingMovements SET merchant_id = ?, category_id = ?, subcategory_id = ? WHERE id = ?',
    [merchant_id, category_id, subcategory_id, movementId],
    callback
  );
};

// Update a pending movement (e.g., approve or reject)
const updatePendingMovement = (movementId, movementData, callback) => {
  const {
    merchant_id,
    category_id,
    subcategory_id,
    status
  } = movementData;

  db.query(
    'UPDATE PendingMovements SET merchant_id = ?, category_id = ?, subcategory_id = ?, status = ? WHERE id = ?',
    [merchant_id, category_id, subcategory_id, status, movementId],
    callback
  );
};

// Delete a pending movement
const deletePendingMovement = (movementId, callback) => {
  db.query('DELETE FROM PendingMovements WHERE id = ?', [movementId], callback);
};

// Get a pending movement by ID
const getPendingMovementById = (movementId, callback) => {
  db.query('SELECT * FROM PendingMovements WHERE id = ?', [movementId], callback);
};

// Bulk insert multiple pending movements
const bulkInsertPendingMovements = async (movements) => {
  const sqlCheckPending = `SELECT transaction_number FROM PendingMovements WHERE transaction_number = ?`;
  const sqlCheckApproved = `SELECT transaction_number FROM Movements WHERE transaction_number = ?`;

  const sqlInsert = `INSERT INTO PendingMovements
                    (account_number, account_name, counterparty_account, transaction_number, booking_date, value_date, amount, currency, description, transaction_details, message, status)
                    VALUES ?`;

  const values = [];

  try {
    const checkExistencePromises = movements.map(movement => {
      return new Promise((resolve, reject) => {
        db.query(sqlCheckPending, [movement.transaction_number], (err, resultPending) => {
          if (err) {
            return reject(err);
          }

          if (resultPending.length === 0) {
            db.query(sqlCheckApproved, [movement.transaction_number], (err, resultApproved) => {
              if (err) {
                return reject(err);
              }
              if (resultApproved.length === 0) {
                values.push([
                  movement.account_number,
                  movement.account_name,
                  movement.counterparty_account,
                  movement.transaction_number,
                  movement.booking_date,
                  movement.value_date,
                  movement.amount,
                  movement.currency,
                  movement.description,
                  movement.transaction_details,
                  movement.message,
                  movement.status
                ]);
              }
              resolve();
            });
          } else {
            resolve();  // Resolve immediately if found in PendingMovements
          }
        });
      });
    });

    await Promise.all(checkExistencePromises);

    if (values.length === 0) {
      return { inserted: 0 };
    }

    const result = await new Promise((resolve, reject) => {
      db.query(sqlInsert, [values], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve({ inserted: result.affectedRows });
      });
    });

    return result;

  } catch (err) {
    throw new Error(`Error inserting pending movements: ${err.message}`);
  }
};

module.exports = {
  createPendingMovement,
  getAllPendingMovements,
  getUnmatchedMovements,
  updateMovementWithMerchant,
  updatePendingMovement,
  deletePendingMovement,
  getPendingMovementById,
  bulkInsertPendingMovements // Now returns a Promise
};


module.exports = {
  createPendingMovement,
  getAllPendingMovements,
  getUnmatchedMovements, // Export the getUnmatchedMovements function
  updateMovementWithMerchant, // Export the updateMovementWithMerchant function
  updatePendingMovement,
  deletePendingMovement,
  getPendingMovementById,
  bulkInsertPendingMovements
};
