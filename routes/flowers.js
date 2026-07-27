const express = require('express');
const router = express.Router();
const { Flower } = require('../models/mongoModels');

// list all available flowers
router.get('/', async (req, res) => {
  try {
    const list = await Flower.find().sort({ name: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// add a new flower type
router.post('/', async (req, res) => {
  const { name, name_ta, default_rate, unit } = req.body;
  try {
    const flower = await Flower.create({
      name,
      name_ta,
      default_rate,
      unit,
      stock_qty: 0
    });
    res.json(flower);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// edit a flower
router.put('/:id', async (req, res) => {
  const { name, name_ta, default_rate, unit, stock_qty } = req.body;
  try {
    const flower = await Flower.findByIdAndUpdate(
      req.params.id,
      { name, name_ta, default_rate, unit, stock_qty },
      { new: true }
    );
    res.json(flower);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// remove a flower
router.delete('/:id', async (req, res) => {
  try {
    await Flower.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Flower deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;