const express = require('express');
const router = express.Router();
const BankAccountController = require('../controllers/BankAccountController');

// Routes for bank accounts
router.get('/', BankAccountController.getAllBankAccounts);
router.get('/:id', BankAccountController.getBankAccountById);
router.post('/', BankAccountController.createBankAccount);
router.put('/:id', BankAccountController.updateBankAccount);
router.delete('/:id', BankAccountController.deleteBankAccount);

module.exports = router;
