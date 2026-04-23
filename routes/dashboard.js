const express = require('express');
const router = express.Router();
const store = require('../db/dbManager');
const { Customer, Flower, Invoice, Payment, StockEntry } = require('../models/mongoModels');

router.get('/', async (req, res) => {
  try {
    // we use this dummy check to see if sql is up
    const status = await store.read(
      'SELECT 1', 
      [],
      async () => {
        // if sql is down, we pull everything from mongo
        const cCount = await Customer.countDocuments();
        const fCount = await Flower.countDocuments();
        const iCount = await Invoice.countDocuments();
        
        const invs = await Invoice.find();
        const sales = invs.reduce((sum, i) => sum + i.total_amount, 0);
        
        const creditCusts = await Customer.find({ current_balance: { $lt: 0 } });
        const credit = creditCusts.reduce((sum, c) => sum + c.current_balance, 0);
        
        const pays = await Payment.find();
        const cleared = pays.reduce((sum, p) => sum + p.amount, 0);

        const newOnes = await Customer.find().sort({ created_at: -1 }).limit(5);

        return {
          customers: cCount,
          flowers: fCount,
          invoices: iCount,
          totalSales: sales,
          totalCredit: Math.abs(credit),
          creditsCleared: cleared,
          newCustomers: newOnes,
          stockOut: [], 
          newStock: []
        };
      }
    );

    // if status already has the counts, it means it fell back to mongo
    if (status && status.customers !== undefined) {
       return res.json(status);
    }

    // sql is up, so we run the heavy queries there
    // Fixed destructuring: store.read returns 'rows', which is already an array of results.
    const [{ customers }] = await store.read('SELECT COUNT(*) as customers FROM customers');
    const [{ flowers }] = await store.read('SELECT COUNT(*) as flowers FROM flowers');
    const [{ invoices }] = await store.read('SELECT COUNT(*) as invoices FROM invoices');
    const [{ totalSales }] = await store.read('SELECT IFNULL(SUM(total_amount), 0) as totalSales FROM invoices');
    const [{ totalCredit }] = await store.read('SELECT IFNULL(SUM(current_balance), 0) as totalCredit FROM customers WHERE current_balance < 0');
    const [{ creditsCleared }] = await store.read('SELECT IFNULL(SUM(amount), 0) as creditsCleared FROM payments');
    
    const newCustomers = await store.read('SELECT name, name_ta, created_at FROM customers ORDER BY created_at DESC LIMIT 5');
    
    const stockOut = await store.read(`
      SELECT f.name, f.name_ta, SUM(ii.net_weight) as total_out, f.unit
      FROM invoice_items ii
      JOIN flowers f ON ii.flower_id = f.id
      GROUP BY f.id
    `);

    const newStock = await store.read(`
      SELECT f.name, f.name_ta, se.quantity, se.entry_date
      FROM stock_entries se
      JOIN flowers f ON se.flower_id = f.id
      ORDER BY se.entry_date DESC
      LIMIT 5
    `);

    res.json({
      customers,
      flowers,
      invoices,
      totalSales,
      totalCredit: Math.abs(totalCredit),
      creditsCleared,
      newCustomers,
      stockOut,
      newStock
    });
  } catch (err) {
    console.log('Dashboard error:', err.message);
    res.status(500).json({ error: 'Failed to load dashboard data: ' + err.message });
  }
});

// payment history list
router.get('/payments', async (req, res) => {
  try {
    const rows = await store.read(
      `SELECT p.*, c.name as customer_name, c.name_ta as customer_name_ta
       FROM payments p
       JOIN customers c ON p.customer_id = c.id
       ORDER BY p.payment_date DESC`,
      [],
      async () => await Payment.find().sort({ payment_date: -1 })
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
