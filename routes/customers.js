const express = require('express');
const router = express.Router();
const { Customer, Payment } = require('../models/mongoModels');

// list all customers
router.get('/', async (req, res) => {
  try {
    const list = await Customer.find().sort({ name: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// add a new one
router.post('/', async (req, res) => {
  const { name, phone, current_balance, name_ta } = req.body;
  try {
    const customer = await Customer.create({
      name,
      name_ta,
      phone,
      current_balance: current_balance || 0
    });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// recording a payment/settlement
router.post('/:id/payments', async (req, res) => {
  const { amount, note, date } = req.body;
  const customerId = req.params.id;
  
  try {
    const payment = await Payment.create({ 
      customer_id: customerId, 
      amount, 
      note, 
      payment_date: date || new Date() 
    });
    
    await Customer.findByIdAndUpdate(customerId, { $inc: { current_balance: -amount } });

    res.json({ status: 'ok', msg: 'Payment recorded', payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get all payments for a customer
router.get('/:id/payments', async (req, res) => {
  try {
    const list = await Payment.find({ customer_id: req.params.id }).sort({ payment_date: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// edit customer
router.put('/:id', async (req, res) => {
  const { name, phone, current_balance, name_ta } = req.body;
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id, 
      { name, name_ta, phone, current_balance },
      { new: true }
    );
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// remove customer
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    // Also cleanup payments?
    await Payment.deleteMany({ customer_id: req.params.id });
    res.json({ msg: 'Customer and related payments removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
