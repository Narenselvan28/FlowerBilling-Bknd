const express = require('express');
const router = express.Router();
const { Customer, Flower, Invoice, Payment, StockEntry } = require('../models/mongoModels');

router.get('/', async (req, res) => {
  try {
    const cCount = await Customer.countDocuments();
    const fCount = await Flower.countDocuments();
    const iCount = await Invoice.countDocuments();
    
    const invs = await Invoice.find();
    const totalSales = invs.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    
    const creditCusts = await Customer.find({ current_balance: { $lt: 0 } });
    const totalCredit = creditCusts.reduce((sum, c) => sum + (c.current_balance || 0), 0);
    
    const pays = await Payment.find();
    const creditsCleared = pays.reduce((sum, p) => sum + (p.amount || 0), 0);

    const newCustomers = await Customer.find().sort({ created_at: -1 }).limit(5);

    // Stock Out (Recent invoice items)
    // For now returning empty or simple list since Mongo aggregation is more complex
    const stockOut = []; 
    
    const newStockDocs = await StockEntry.find().sort({ entry_date: -1 }).limit(5).lean();
    const newStock = [];
    for (let s of newStockDocs) {
      const flower = await Flower.findById(s.flower_id).lean();
      newStock.push({
        name: flower?.name,
        name_ta: flower?.name_ta,
        quantity: s.quantity,
        entry_date: s.entry_date
      });
    }

    res.json({
      customers: cCount,
      flowers: fCount,
      invoices: iCount,
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
    const payments = await Payment.find().sort({ payment_date: -1 }).lean();
    
    for (let p of payments) {
      if (p.customer_id) {
        const customer = await Customer.findById(p.customer_id).lean();
        p.customer_name = customer?.name;
        p.customer_name_ta = customer?.name_ta;
      }
    }
    
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
