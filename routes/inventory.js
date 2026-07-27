const express = require('express');
const router = express.Router();
const { StockEntry, Flower } = require('../models/mongoModels');

// Add stock entry
router.post('/stock', async (req, res) => {
  const { flower_id, quantity, note } = req.body;
  try {
    const entry = await StockEntry.create({
      flower_id,
      quantity,
      note,
      entry_date: new Date()
    });

    // Update the master stock in the Flower model
    await Flower.findByIdAndUpdate(flower_id, { $inc: { stock_qty: quantity } });

    res.json({ msg: 'Stock updated successfully', entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get stock history
router.get('/history', async (req, res) => {
  try {
    const entries = await StockEntry.find().sort({ entry_date: -1 }).lean();
    
    // Join flower info for frontend
    for (let entry of entries) {
      const flower = await Flower.findById(entry.flower_id).lean();
      entry.name = flower?.name;
      entry.name_ta = flower?.name_ta;
      entry.unit = flower?.unit;
    }

    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
