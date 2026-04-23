const express = require('express');
const router = express.Router();
const { Invoice, Payment, Customer } = require('../models/mongoModels');

// Create a new invoice
router.post('/', async (req, res) => {
  const { customer_id, payment_mode, total_amount, amount_paid, previous_balance, final_balance, items } = req.body;
  
  try {
    const inv = await Invoice.create({
      customer_id,
      total_amount,
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
    
    if (amount_paid > 0) {
      await Payment.create({ customer_id, amount: amount_paid });
    }
    
    await Customer.findByIdAndUpdate(customer_id, { current_balance: final_balance });

    res.json({ id: inv._id.toString(), msg: 'Invoice saved' });
  } catch (err) {
    console.error('Invoice error:', err);
    res.status(500).json({ error: 'Something went wrong while saving invoice' });
  }
});

// fetch all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ created_at: -1 });
    
    // populate customer names manually
    const customerIds = [...new Set(invoices.map(i => i.customer_id))];
    const customers = await Customer.find({ _id: { $in: customerIds } });
    
    const customerMap = {};
    customers.forEach(c => {
      customerMap[c._id.toString()] = c;
    });

    const enrichedInvoices = invoices.map(inv => {
      const cust = customerMap[inv.customer_id] || {};
      return {
        ...inv.toObject(),
        id: inv._id.toString(),
        customer_name: cust.name || 'Unknown',
        customer_name_ta: cust.name_ta || ''
      };
    });
    
    res.json(enrichedInvoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get details for one invoice
router.get('/:id', async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id).lean();
    if (!inv) return res.status(404).json({ msg: 'Invoice not found' });

    const cust = await Customer.findById(inv.customer_id).lean();
    
    const result = {
      ...inv,
      id: inv._id.toString(),
      customer_name: cust ? cust.name : 'Unknown',
      customer_name_ta: cust ? cust.name_ta : '',
      customer_phone: cust ? cust.phone : ''
    };

    res.json(result);
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
