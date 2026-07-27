const express = require('express');
const router = express.Router();
const { Expense } = require('../models/mongoModels');

// fetch all expenses
router.get('/', async (req, res) => {
  try {
    const list = await Expense.find().sort({ date: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// record a new expense
router.post('/', async (req, res) => {
  const { type, amount, note, date } = req.body;
  try {
    const expense = await Expense.create({
      type,
      amount,
      note,
      date: date || new Date()
    });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update an expense
router.put('/:id', async (req, res) => {
  const { type, amount, note, date } = req.body;
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { type, amount, note, date },
      { new: true }
    );
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete an expense
router.delete('/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

