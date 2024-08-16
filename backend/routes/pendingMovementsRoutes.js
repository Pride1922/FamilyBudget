const express = require('express');
const router = express.Router();
const PendingMovementsController = require('../controllers/pendingMovementsController');

// Ensure all these functions are correctly defined in the controller
router.get('/', PendingMovementsController.getAllPendingMovements);
router.get('/:id', PendingMovementsController.getPendingMovementById);
router.post('/', PendingMovementsController.createPendingMovement);
router.put('/:id', PendingMovementsController.updatePendingMovement);
router.delete('/:id', PendingMovementsController.deletePendingMovement);
router.post('/upload', PendingMovementsController.uploadCSV);

module.exports = router;
