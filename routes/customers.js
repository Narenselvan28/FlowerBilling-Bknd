const express = require('express');
const router = express.Router();
const store = require('../db/dbManager');
const { Customer, Payment } = require('../models/mongoModels');

// list all customers
router.get('/', async (req, res) => {
  try {
    const list = await store.read(
      'SELECT * FROM customers ORDER BY name',
      [],
      async () => await Customer.find().sort({ name: 1 })
    );
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// add a new one
router.post('/', async (req, res) => {
  const { name, phone, current_balance } = req.body;
  try {
    const info = await store.write(
      'INSERT INTO customers (name, phone, current_balance) VALUES (?, ?, ?)',
      [name, phone, current_balance || 0],
      async (sqlRes) => {
        return await Customer.create({
          sqlId: sqlRes ? sqlRes.insertId : null,
          name,
          phone,
          current_balance: current_balance || 0
        });
      }
    );
    // use sql id if we have it, else fallback to mongo _id
    const finalId = info.sqlRes ? info.sqlRes.insertId : info.mongoRes._id;
    res.json({ id: finalId, name, phone, current_balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// recording a payment/settlement
router.post('/payment', async (req, res) => {
  const { customer_id, amount } = req.body;
  
  try {
    // wrap sql in tx, then sync to mongo after
    await store.startTx(async (conn) => {
      await conn.query('INSERT INTO payments (customer_id, amount) VALUES (?, ?)', [customer_id, amount]);
      await conn.query('UPDATE customers SET current_balance = current_balance + ? WHERE id = ?', [amount, customer_id]);
    });

    // backup to mongo
    try {
      await Payment.create({ customer_id, amount });
      await Customer.findOneAndUpdate({ sqlId: customer_id }, { $inc: { current_balance: amount } });
    } catch (e) {
      console.log('Mongo payment sync failed:', e.message);
      // not throwing here, sql is already committed
    }

    res.json({ status: 'ok', msg: 'Payment recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// edit customer
router.put('/:id', async (req, res) => {
  const { name, phone, current_balance } = req.body;
  try {
    await store.write(
      'UPDATE customers SET name = ?, phone = ?, current_balance = ? WHERE id = ?',
      [name, phone, current_balance, req.params.id],
      async () => {
        await Customer.findOneAndUpdate({ sqlId: req.params.id }, { name, phone, current_balance });
      }
    );
    res.json({ msg: 'Customer updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// remove customer
router.delete('/:id', async (req, res) => {
  try {
    await store.write(
      'DELETE FROM customers WHERE id = ?',
      [req.params.id],
      async () => {
        await Customer.deleteOne({ sqlId: req.params.id });
      }
    );
    res.json({ msg: 'Customer removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
