const express = require('express');
const router = express.Router();
const store = require('../db/dbManager');
const { Invoice, Payment, Customer } = require('../models/mongoModels');

// Create a new invoice
router.post('/', async (req, res) => {
  const { customer_id, payment_mode, total_amount, amount_paid, previous_balance, final_balance, items } = req.body;
  
  try {
    let invId = null;
    
    // doing the sql part in a transaction to be safe
    await store.startTx(async (conn) => {
      // 1. insert the main invoice
      const [inv] = await conn.query(
        'INSERT INTO invoices (customer_id, payment_mode, total_amount, amount_paid, previous_balance, final_balance) VALUES (?, ?, ?, ?, ?, ?)',
        [customer_id, payment_mode || 'Credit', total_amount, amount_paid || 0, previous_balance, final_balance]
      );
      invId = inv.insertId;

      // 2. if they paid something, record it
      if (amount_paid > 0) {
        await conn.query('INSERT INTO payments (customer_id, amount) VALUES (?, ?)', [customer_id, amount_paid]);
      }

      // 3. items
      for (const itm of items) {
        await conn.query(
          'INSERT INTO invoice_items (invoice_id, flower_id, gross_weight, less_weight, net_weight, rate, amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [invId, itm.flower_id, itm.gross_weight, itm.less_weight, itm.net_weight, itm.rate, itm.amount]
        );
      }

      // 4. update balance. frontend sends the final calc so we just trust it for now
      await conn.query('UPDATE customers SET current_balance = ? WHERE id = ?', [final_balance, customer_id]);
    });

    // Backup to Mongo - wrapping in try/catch so it doesn't kill the main response if it fails
    try {
      await Invoice.create({
        sqlId: invId,
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
      
      await Customer.findOneAndUpdate({ sqlId: customer_id }, { current_balance: final_balance });
      console.log('Mongo sync done for invoice:', invId);
    } catch (err) {
      console.log('Mongo backup failed for invoice, but SQL is fine:', err.message);
    }

    res.json({ id: invId, msg: 'Invoice saved' });
  } catch (err) {
    console.error('Invoice error:', err);
    res.status(500).json({ error: 'Something went wrong while saving invoice' });
  }
});

// fetch all invoices
router.get('/', async (req, res) => {
  try {
    const data = await store.read(
      `SELECT i.*, c.name as customer_name, c.name_ta as customer_name_ta 
       FROM invoices i 
       JOIN customers c ON i.customer_id = c.id 
       ORDER BY i.created_at DESC`,
      [],
      async () => await Invoice.find().sort({ created_at: -1 })
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get details for one invoice
router.get('/:id', async (req, res) => {
  try {
    const invData = await store.read(
      `SELECT i.*, c.name as customer_name, c.name_ta as customer_name_ta, c.phone as customer_phone
       FROM invoices i 
       JOIN customers c ON i.customer_id = c.id 
       WHERE i.id = ?`,
      [req.params.id],
      async () => {
        const doc = await Invoice.findOne({ sqlId: req.params.id }).lean();
        return doc ? [doc] : [];
      }
    );

    if (!invData || invData.length === 0) return res.status(404).json({ msg: 'Invoice not found' });

    const itmList = await store.read(
      `SELECT it.*, f.name as flower_name, f.name_ta as flower_name_ta, f.unit
       FROM invoice_items it
       JOIN flowers f ON it.flower_id = f.id
       WHERE it.invoice_id = ?`,
      [req.params.id],
      async () => {
        const doc = await Invoice.findOne({ sqlId: req.params.id }).lean();
        return doc ? doc.items : [];
      }
    );

    res.json({ ...invData[0], items: itmList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get invoices for a specific customer
router.get('/customer/:id', async (req, res) => {
  try {
    const list = await store.read(
      `SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC`,
      [req.params.id],
      async () => await Invoice.find({ customer_id: req.params.id }).sort({ created_at: -1 })
    );
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

