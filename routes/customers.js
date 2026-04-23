const express = require('express');
const router = express.Router();
const { Customer, Payment } = require('../models/mongoModels');

// list all customers
router.get('/', async (req, res) => {
  try {
    const list = await Customer.find().sort({ name: 1 });
    // mapping _id to id so frontend doesn't break
    const formattedList = list.map(c => ({
      ...c.toObject(),
      id: c._id.toString()
    }));
    res.json(formattedList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// add a new one
router.post('/', async (req, res) => {
  const { name, phone, current_balance } = req.body;
  try {
    const newCust = await Customer.create({
      name,
      phone,
      current_balance: current_balance || 0
    });
    res.json({ id: newCust._id.toString(), name, phone, current_balance: newCust.current_balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// recording a payment/settlement
router.post('/payment', async (req, res) => {
  const { customer_id, amount } = req.body;
  
  try {
    await Payment.create({ customer_id, amount });
    // Use customer_id directly as it might be an ObjectId string now
    await Customer.findByIdAndUpdate(customer_id, { $inc: { current_balance: amount } });
    
    res.json({ status: 'ok', msg: 'Payment recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// edit customer
router.put('/:id', async (req, res) => {
  const { name, phone, current_balance } = req.body;
  try {
    await Customer.findByIdAndUpdate(req.params.id, { name, phone, current_balance });
    res.json({ msg: 'Customer updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// remove customer
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Customer removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
