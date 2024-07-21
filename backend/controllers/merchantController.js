const merchantModel = require('../models/merchantModel');

const getMerchants = (req, res) => {
  merchantModel.getAllMerchants((err, merchants) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch merchants', error: err.message });
    }
    res.status(200).json(merchants);
  });
};

const getMerchantById = (req, res) => {
  const { id } = req.params;
  merchantModel.getMerchantById(id, (err, merchant) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch merchant', error: err.message });
    }
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }
    res.status(200).json(merchant);
  });
};

const addMerchant = (req, res) => {
  const newMerchant = req.body;
  merchantModel.createMerchant(newMerchant, (err, merchant) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to create merchant', error: err.message });
    }
    res.status(201).json(merchant);
  });
};

const updateMerchant = (req, res) => {
  const { id } = req.params;
  const updatedMerchant = req.body;
  merchantModel.updateMerchant(id, updatedMerchant, (err, merchant) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to update merchant', error: err.message });
    }
    res.status(200).json(merchant);
  });
};

const deleteMerchant = (req, res) => {
  const { id } = req.params;
  merchantModel.deleteMerchant(id, (err, success) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to delete merchant', error: err.message });
    }
    if (!success) {
      return res.status(404).json({ message: 'Merchant not found' });
    }
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
