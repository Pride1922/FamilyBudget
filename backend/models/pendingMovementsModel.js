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
const bulkInsertPendingMovements = (movements, callback) => {
  const sqlCheckPending = `SELECT transaction_number FROM PendingMovements WHERE transaction_number = ?`;
  const sqlCheckApproved = `SELECT transaction_number FROM Movements WHERE transaction_number = ?`;

  const sqlInsert = `INSERT INTO PendingMovements
                    (account_number, account_name, counterparty_account, transaction_number, booking_date, value_date, amount, currency, description, transaction_details, message, status)
                    VALUES ?`;

  const values = [];

  // Check for duplicates in both PendingMovements and Movements tables
  const checkExistencePromises = movements.map(movement => {
    return new Promise((resolve, reject) => {
      db.query(sqlCheckPending, [movement.transaction_number], (err, resultPending) => {
        if (err) {
          return reject(err);
        }

        // If not found in PendingMovements, check in Movements table
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

  // After all checks, perform the bulk insert
  Promise.all(checkExistencePromises)
    .then(() => {
      if (values.length === 0) {
        return callback(null, { inserted: 0 });
      }
      db.query(sqlInsert, [values], (err, result) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, { inserted: result.affectedRows });
      });
    })
    .catch(err => {
      callback(err, null);
    });
};



module.exports = {
  createPendingMovement,
  getAllPendingMovements,
  updatePendingMovement,
  deletePendingMovement,
  getPendingMovementById,
  bulkInsertPendingMovements  // Export the bulk insert function
};
