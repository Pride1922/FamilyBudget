const express = require('express');
const router = express.Router();
const { recoverPassword, resetPassword, verifyResetToken } = require('../controllers/userController');

// Public route for password recovery
router.post('/recover-password', recoverPassword);

// Public route for password reset
router.post('/reset-password', resetPassword);

// Public route verify reset token
router.post('/verify-reset-token', verifyResetToken);

module.exports = router;

