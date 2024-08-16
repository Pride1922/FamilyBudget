const PendingMovementsModel = require('../models/pendingMovementsModel');
const { errorLogger, infoLogger } = require('../config/logger');
const multer = require('multer');
const csvParser = require('csv-parser'); // For parsing CSV files in a stream
const fs = require('fs');

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' }); // Files will be temporarily saved in the 'uploads/' directory

exports.uploadCSV = [
  upload.single('file'),
  (req, res) => {
    const file = req.file;

    if (!file) {
      errorLogger.error('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    fs.createReadStream(file.path)
      .pipe(csvParser({ separator: ';', mapHeaders: ({ header }) => header.trim() })) // Trim headers to avoid leading/trailing spaces
      .on('headers', (headers) => {
      })
      .on('data', (row) => {

        const account_number = row['Rekeningnummer']?.replace(/\s+/g, '').trim();
        const account_name = row['Naam van de rekening']?.trim();
        const counterparty_account = row['Rekening tegenpartij']?.trim();
        const transaction_number = row['Omzetnummer']?.trim();
        const booking_date = row['Boekingsdatum']?.trim();
        const value_date = row['Valutadatum']?.trim();
        const amount = parseFloat(row['Bedrag']?.replace(',', '.'));
        const currency = row['Munteenheid']?.trim();
        const description = row['Omschrijving']?.trim();
        const transaction_details = row['Detail van de omzet']?.trim();
        const message = row['Bericht']?.trim();

        // Convert dates to the correct format (YYYY-MM-DD)
        const formatted_booking_date = formatDate(booking_date);
        const formatted_value_date = formatDate(value_date);

        // Only push valid rows to results
        if (account_number && account_name && transaction_number && formatted_booking_date && formatted_value_date && !isNaN(amount)) {
          results.push({
            account_number,
            account_name,
            counterparty_account,
            transaction_number,
            booking_date: formatted_booking_date,
            value_date: formatted_value_date,
            amount,
            currency,
            description,
            transaction_details,
            message,
            status: 'pending',
          });
        } else {
          console.log('Skipping invalid or incomplete row:', row);
        }
      })
      .on('end', () => {
        if (results.length === 0) {
          errorLogger.error('No valid rows to process');
          return res.status(400).json({ message: 'No valid rows to process' });
        }

        PendingMovementsModel.bulkInsertPendingMovements(results, (err, response) => {
          if (err) {
            errorLogger.error(`Failed to insert pending movements: ${err.message}`);
            return res.status(500).json({ message: 'Error processing CSV data', err });
          }

          fs.unlinkSync(file.path);

          infoLogger.info('CSV file processed and movements inserted successfully');
          res.status(200).json({ message: 'CSV file processed successfully', inserted: response.inserted });
        });
      })
      .on('error', (error) => {
        errorLogger.error(`Error parsing CSV file: ${error.message}`);
        fs.unlinkSync(file.path);
        res.status(500).json({ message: 'Error parsing CSV file', error });
      });
  },
];

// Function to convert dates from 'DD/MM/YYYY' to 'YYYY-MM-DD'
function formatDate(dateString) {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
}

// Placeholder for getting all pending movements
exports.getAllPendingMovements = (req, res) => {
  // Replace this with the actual implementation
  PendingMovementsModel.getAllPendingMovements((err, movements) => {
    if (err) {
      errorLogger.error(`Failed to fetch pending movements: ${err.message}`);
      return res.status(500).json({ message: 'Error fetching pending movements', err });
    }
    infoLogger.info('Fetched all pending movements successfully');
    res.status(200).json(movements);
  });
};

// Placeholder for getting a pending movement by ID
exports.getPendingMovementById = (req, res) => {
  const { id } = req.params;
  PendingMovementsModel.getPendingMovementById(id, (err, movement) => {
    if (err) {
      errorLogger.error(`Failed to fetch pending movement with ID ${id}: ${err.message}`);
      return res.status(500).json({ message: 'Error fetching pending movement', err });
    }
    if (!movement) {
      infoLogger.info(`Pending movement with ID ${id} not found`);
      return res.status(404).json({ message: 'Pending movement not found' });
    }
    infoLogger.info(`Fetched pending movement with ID ${id} successfully`);
    res.status(200).json(movement);
  });
};

// Placeholder for creating a pending movement
exports.createPendingMovement = (req, res) => {
  const newMovement = req.body;
  infoLogger.info(`Creating new pending movement: ${JSON.stringify(newMovement)}`);
  PendingMovementsModel.createPendingMovement(newMovement, (err, movement) => {
    if (err) {
      errorLogger.error(`Failed to create pending movement: ${err.message}`);
      return res.status(400).json({ message: 'Error creating pending movement', err });
    }
    infoLogger.info(`Created new pending movement with ID ${movement.insertId} successfully`);
    res.status(201).json(movement);
  });
};

// Placeholder for updating a pending movement
exports.updatePendingMovement = (req, res) => {
  const { id } = req.params;
  const updatedMovement = req.body;
  infoLogger.info(`Updating pending movement with ID ${id}: ${JSON.stringify(updatedMovement)}`);
  PendingMovementsModel.updatePendingMovement(id, updatedMovement, (err, movement) => {
    if (err) {
      errorLogger.error(`Failed to update pending movement with ID ${id}: ${err.message}`);
      return res.status(400).json({ message: 'Error updating pending movement', err });
    }
    infoLogger.info(`Updated pending movement with ID ${id} successfully`);
    res.status(200).json(movement);
  });
};

// Placeholder for deleting a pending movement
exports.deletePendingMovement = (req, res) => {
  const { id } = req.params;
  infoLogger.info(`Deleting pending movement with ID ${id}`);
  PendingMovementsModel.deletePendingMovement(id, (err, success) => {
    if (err) {
      errorLogger.error(`Failed to delete pending movement with ID ${id}: ${err.message}`);
      return res.status(500).json({ message: 'Error deleting pending movement', err });
    }
    if (!success) {
      infoLogger.info(`Pending movement with ID ${id} not found`);
      return res.status(404).json({ message: 'Pending movement not found' });
    }
    infoLogger.info(`Deleted pending movement with ID ${id} successfully`);
    res.status(200).json({ message: 'Pending movement deleted' });
  });
};
