const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');

// Route to get all merchants
router.get('/', merchantController.getMerchants);

// Route to get a single merchant by ID
router.get('/:id', merchantController.getMerchantById);

// Route to create a new merchant
router.post('/', merchantController.addMerchant);

// Route to update a merchant by ID
router.put('/:id', merchantController.updateMerchant);

// Route to delete a merchant by ID
router.delete('/:id', merchantController.deleteMerchant);

module.exports = router;
