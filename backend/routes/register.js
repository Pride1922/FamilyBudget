// backend/routes/register.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const registerController = require('../controllers/registerController');

// Register endpoint
router.post('/register', userController.registerUser);

//Send Registration Email
router.post('/sendregistrationemail', registerController.sendRegistrationEmail);

module.exports = router;
