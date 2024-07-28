const merchantModel = require('../models/merchantModel');
const { errorLogger, infoLogger } = require('../config/logger');

const getMerchants = (req, res) => {
  merchantModel.getAllMerchants((err, merchants) => {
    if (err) {
      errorLogger.error(`Failed to fetch merchants: ${err.message}`);
      return res.status(500).json({ message: 'Failed to fetch merchants', error: err.message });
    }
    infoLogger.info('Fetched all merchants successfully');
    res.status(200).json(merchants);
  });
};

const getMerchantById = (req, res) => {
  const { id } = req.params;
  merchantModel.getMerchantById(id, (err, merchant) => {
    if (err) {
      errorLogger.error(`Failed to fetch merchant with ID ${id}: ${err.message}`);
      return res.status(500).json({ message: 'Failed to fetch merchant', error: err.message });
    }
    if (!merchant) {
      infoLogger.info(`Merchant with ID ${id} not found`);
      return res.status(404).json({ message: 'Merchant not found' });
    }
    infoLogger.info(`Fetched merchant with ID ${id} successfully`);
    res.status(200).json(merchant);
  });
};

const addMerchant = (req, res) => {
  const newMerchant = req.body;
  merchantModel.createMerchant(newMerchant, (err, merchant) => {
    if (err) {
      errorLogger.error(`Failed to create merchant: ${err.message}`);
      return res.status(500).json({ message: 'Failed to create merchant', error: err.message });
    }
    infoLogger.info(`Created new merchant with ID ${merchant.id} successfully`);
    res.status(201).json(merchant);
  });
};

const updateMerchant = (req, res) => {
  const { id } = req.params;
  const updatedMerchant = req.body;
  merchantModel.updateMerchant(id, updatedMerchant, (err, merchant) => {
    if (err) {
      errorLogger.error(`Failed to update merchant with ID ${id}: ${err.message}`);
      return res.status(500).json({ message: 'Failed to update merchant', error: err.message });
    }
    infoLogger.info(`Updated merchant with ID ${id} successfully`);
    res.status(200).json(merchant);
  });
};

const deleteMerchant = (req, res) => {
  const { id } = req.params;
  merchantModel.deleteMerchant(id, (err, success) => {
    if (err) {
      errorLogger.error(`Failed to delete merchant with ID ${id}: ${err.message}`);
      return res.status(500).json({ message: 'Failed to delete merchant', error: err.message });
    }
    if (!success) {
      infoLogger.info(`Merchant with ID ${id} not found`);
      return res.status(404).json({ message: 'Merchant not found' });
    }
    infoLogger.info(`Deleted merchant with ID ${id} successfully`);
    res.status(204).send();
  });
};

module.exports = {
  getMerchants,
  getMerchantById,
  addMerchant,
  updateMerchant,
  deleteMerchant
};
