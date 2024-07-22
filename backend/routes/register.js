const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');
const userController = require('../controllers/userController');

// Send Registration Email
router.post('/sendregistrationemail', registerController.sendRegistrationEmail);

// Register endpoint
router.post('/registeruser', userController.registerUser);


module.exports = router;