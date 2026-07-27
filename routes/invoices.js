const express = require('express');
const router = express.Router();
const { Invoice, Payment, Customer, Flower } = require('../models/mongoModels');

// Create a new invoice
router.post('/', async (req, res) => {
  const { customer_id, payment_mode, total_amount, amount_paid, previous_balance, final_balance, items } = req.body;
  
  try {
    // 1. Create the invoice
    const invoice = await Invoice.create({
      customer_id,
      payment_mode: payment_mode || 'Credit',
      total_amount,
      amount_paid: amount_paid || 0,
      previous_balance,
      final_balance,
      items: items.map(i => ({
        flower_id: i.flower_id,
        gross_weight: i.gross_weight,
        less_weight: i.less_weight,
        net_weight: i.net_weight,
        rate: i.rate,
        amount: i.amount
      }))
    });

    // 2. If they paid something, record it
    if (amount_paid > 0) {
      await Payment.create({ 
        customer_id, 
        amount: amount_paid, 
        note: `Paid against Invoice #${invoice.id}` 
      });
    }

    // 3. Update customer balance
    await Customer.findByIdAndUpdate(customer_id, { current_balance: final_balance });

    // 4. Update flower stock (decrement by net_weight)
    for (const itm of items) {
      if (itm.flower_id) {
        await Flower.findByIdAndUpdate(itm.flower_id, { $inc: { stock_qty: -itm.net_weight } });
      }
    }

    res.json(invoice);
  } catch (err) {
    console.error('Invoice error:', err);
    res.status(500).json({ error: 'Something went wrong while saving invoice' });
  }
});

// fetch all invoices
router.get('/', async (req, res) => {
  try {
    const data = await Invoice.find().sort({ created_at: -1 });
    // In a real app, you might want to join customer names here
    // For now, I'll return the raw list as the frontend might handle lookups
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get details for one invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).lean();
    if (!invoice) return res.status(404).json({ msg: 'Invoice not found' });
    
    // Convert customer_id and flower_id to names for legacy frontend support
    if (invoice.customer_id) {
      const customer = await Customer.findById(invoice.customer_id).lean();
      invoice.customer_name = customer?.name;
      invoice.customer_name_ta = customer?.name_ta;
      invoice.customer_phone = customer?.phone;
    }
    
    for (let itm of invoice.items) {
      if (itm.flower_id) {
        const flower = await Flower.findById(itm.flower_id).lean();
        itm.flower_name = flower?.name;
        itm.flower_name_ta = flower?.name_ta;
        itm.unit = flower?.unit;
      }
    }

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get invoices for a specific customer
router.get('/customer/:id', async (req, res) => {
  try {
    const list = await Invoice.find({ customer_id: req.params.id }).sort({ created_at: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

