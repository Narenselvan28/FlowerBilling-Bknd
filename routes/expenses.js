const express = require('express');
const router = express.Router();
const { Expense } = require('../models/mongoModels');

// fetch all expenses
router.get('/', async (req, res) => {
  try {
    const list = await Expense.find().sort({ date: -1 });
    const formattedList = list.map(e => ({
      ...e.toObject(),
      id: e._id.toString()
    }));
    res.json(formattedList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// record a new expense
router.post('/', async (req, res) => {
  const { type, amount, note, date } = req.body;
  try {
    await Expense.create({
      type,
      amount,
      note,
      date: date || new Date()
    });
    res.json({ status: 'ok', msg: 'Expense saved' });
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
