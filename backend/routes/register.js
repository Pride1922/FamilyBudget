// backend/routes/register.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Register endpoint
router.post('/register', userController.registerUser);

module.exports = router;
