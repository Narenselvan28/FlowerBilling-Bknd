const express = require('express');
const router = express.Router();
const store = require('../db/dbManager');
const { Flower } = require('../models/mongoModels');

// list all available flowers
router.get('/', async (req, res) => {
  try {
    const list = await store.read(
      'SELECT * FROM flowers ORDER BY name',
      [],
      async () => await Flower.find().sort({ name: 1 })
    );
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// add a new flower type
router.post('/', async (req, res) => {
  const { name, default_rate, unit } = req.body;
  try {
    const info = await store.write(
      'INSERT INTO flowers (name, default_rate, unit) VALUES (?, ?, ?)',
      [name, default_rate, unit],
      async (sqlRes) => {
        return await Flower.create({
          sqlId: sqlRes ? sqlRes.insertId : null,
          name,
          default_rate,
          unit
        });
      }
    );
    // return the id (prefer sql but fallback to mongo)
    const id = info.sqlRes ? info.sqlRes.insertId : info.mongoRes._id;
    res.json({ id, name, default_rate, unit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// edit a flower
router.put('/:id', async (req, res) => {
  const { name, default_rate, unit } = req.body;
  try {
    await store.write(
      'UPDATE flowers SET name = ?, default_rate = ?, unit = ? WHERE id = ?',
      [name, default_rate, unit, req.params.id],
      async () => {
        await Flower.findOneAndUpdate({ sqlId: req.params.id }, { name, default_rate, unit });
      }
    );
    res.json({ msg: 'Flower updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// remove a flower
router.delete('/:id', async (req, res) => {
  try {
    await store.write(
      'DELETE FROM flowers WHERE id = ?',
      [req.params.id],
      async () => {
        await Flower.deleteOne({ sqlId: req.params.id });
      }
    );
    res.json({ msg: 'Flower deleted' });
  } catch (err) {
    if (err.message.includes('foreign key constraint fails')) {
      return res.status(400).json({ error: 'Cannot delete this flower because it has been used in previous bills. Try editing it instead.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
