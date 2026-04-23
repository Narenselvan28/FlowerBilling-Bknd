const express = require('express');
const router = express.Router();
const { Flower } = require('../models/mongoModels');

// list all available flowers
router.get('/', async (req, res) => {
  try {
    const list = await Flower.find().sort({ name: 1 });
    const formattedList = list.map(f => ({
      ...f.toObject(),
      id: f._id.toString()
    }));
    res.json(formattedList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// add a new flower type
router.post('/', async (req, res) => {
  const { name, default_rate, unit } = req.body;
  try {
    const newFlower = await Flower.create({
      name,
      default_rate,
      unit
    });
    res.json({ id: newFlower._id.toString(), name, default_rate, unit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// edit a flower
router.put('/:id', async (req, res) => {
  const { name, default_rate, unit } = req.body;
  try {
    await Flower.findByIdAndUpdate(req.params.id, { name, default_rate, unit });
    res.json({ msg: 'Flower updated' });
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
