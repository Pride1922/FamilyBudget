const BankAccountModel = require('../models/bankAccountModel');
const { errorLogger, infoLogger } = require('../config/logger');

// Controller to get all bank accounts
exports.getAllBankAccounts = (req, res) => {
  BankAccountModel.getAllBankAccounts((err, accounts) => {
    if (err) {
      errorLogger.error(`Failed to fetch bank accounts: ${err.message}`);
      return res.status(500).json({ message: 'Error fetching bank accounts', err });
    }
    infoLogger.info('Fetched all bank accounts successfully');
    res.status(200).json(accounts);
  });
};

// Controller to get a bank account by ID
exports.getBankAccountById = (req, res) => {
  const { id } = req.params;
  BankAccountModel.getBankAccountById(id, (err, account) => {
    if (err) {
      errorLogger.error(`Failed to fetch bank account with ID ${id}: ${err.message}`);
      return res.status(500).json({ message: 'Error fetching bank account', err });
    }
    if (!account) {
      infoLogger.info(`Bank account with ID ${id} not found`);
      return res.status(404).json({ message: 'Bank account not found' });
    }
    infoLogger.info(`Fetched bank account with ID ${id} successfully`);
    res.status(200).json(account);
  });
};

// Controller to create a new bank account
exports.createBankAccount = (req, res) => {
  const newBankAccount = req.body;
  infoLogger.info(`Creating new bank account: ${JSON.stringify(newBankAccount)}`);
  BankAccountModel.createBankAccount(newBankAccount, (err, account) => {
    if (err) {
      errorLogger.error(`Failed to create bank account: ${err.message}`);
      return res.status(400).json({ message: 'Error creating bank account', err });
    }
    infoLogger.info(`Created new bank account with ID ${account.id} successfully`);
    res.status(201).json(account);
  });
};

// Controller to update an existing bank account
exports.updateBankAccount = (req, res) => {
  const { id } = req.params;
  const updatedBankAccount = req.body;
  infoLogger.info(`Updating bank account with ID ${id}: ${JSON.stringify(updatedBankAccount)}`);
  BankAccountModel.updateBankAccount(id, updatedBankAccount, (err, account) => {
    if (err) {
      errorLogger.error(`Failed to update bank account with ID ${id}: ${err.message}`);
      return res.status(400).json({ message: 'Error updating bank account', err });
    }
    infoLogger.info(`Updated bank account with ID ${id} successfully`);
    res.status(200).json(account);
  });
};

// Controller to delete a bank account
exports.deleteBankAccount = (req, res) => {
  const { id } = req.params;
  infoLogger.info(`Deleting bank account with ID ${id}`);
  BankAccountModel.deleteBankAccount(id, (err, success) => {
    if (err) {
      errorLogger.error(`Failed to delete bank account with ID ${id}: ${err.message}`);
      return res.status(500).json({ message: 'Error deleting bank account', err });
    }
    if (!success) {
      infoLogger.info(`Bank account with ID ${id} not found`);
      return res.status(404).json({ message: 'Bank account not found' });
    }
    infoLogger.info(`Deleted bank account with ID ${id} successfully`);
    res.status(200).json({ message: 'Bank account deleted' });
  });
};
