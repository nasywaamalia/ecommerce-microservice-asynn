const express = require('express');

const router = express.Router();

const transactionController =
require('../controllers/transactionController');

// CREATE
router.post('/', transactionController.createTransaction);

// GET ALL 🔥 TAMBAH INI
router.get('/', transactionController.getAllTransactions);

// GET BY ID
router.get('/:id', transactionController.getTransactionById);

module.exports = router;