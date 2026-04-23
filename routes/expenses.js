const express = require('express');
const router = express.Router();
const store = require('../db/dbManager');
const { Expense } = require('../models/mongoModels');

// fetch all expenses
router.get('/', async (req, res) => {
  try {
    const list = await store.read(
      'SELECT * FROM expenses ORDER BY date DESC',
      [],
      async () => await Expense.find().sort({ date: -1 })
    );
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// record a new expense
router.post('/', async (req, res) => {
  const { type, amount, note, date } = req.body;
  try {
    await store.write(
      'INSERT INTO expenses (type, amount, note, date) VALUES (?, ?, ?, ?)',
      [type, amount, note, date],
      async (sqlRes) => {
        await Expense.create({
          sqlId: sqlRes ? sqlRes.insertId : null,
          type,
          amount,
          note,
          date: date || new Date()
        });
      }
    );
    res.json({ status: 'ok', msg: 'Expense saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete an expense
router.delete('/:id', async (req, res) => {
  try {
    await store.write(
      'DELETE FROM expenses WHERE id = ?',
      [req.params.id],
      async () => {
        await Expense.deleteOne({ sqlId: req.params.id });
      }
    );
    res.json({ msg: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

