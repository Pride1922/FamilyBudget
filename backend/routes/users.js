const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const {
  updateUser,
  getAllUsers,
  getUserById,
  addUser,
  deleteUser,
  changePassword
} = require('../controllers/userController');

// PUT user endpoint
router.put('/:id', authenticateToken, authorizeRoles(['admin']), updateUser);

// GET all users endpoint
router.get('/', authenticateToken, authorizeRoles(['admin']), getAllUsers);

// GET user data based on JWT token
router.get('/user', authenticateToken, getUserById);

// POST add a new user endpoint
router.post('/', authenticateToken, authorizeRoles(['admin']), addUser);

// DELETE user endpoint
router.delete('/:id', authenticateToken, authorizeRoles(['admin']), deleteUser);

// POST change password endpoint
router.post('/change-password', authenticateToken, changePassword);

module.exports = router;
