const express = require('express');
const router = express.Router();
const Transactions = require('../models/Transactions');

// Route to post a new transaction
router.post('/', async (req, res) => {
    try {
        const newTransaction = await Transactions.create(req.body);
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Route to get all transactions
router.get('/', async (req, res) => {
    try {
        const transactions = await Transactions.find();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route to get a single transaction by ID
router.get('/:id', async (req, res) => {
    try {
        const transaction = await Transactions.findById(req.params.id);
        if (transaction == null) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
