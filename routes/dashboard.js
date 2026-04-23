const express = require('express');
const router = express.Router();
const { Customer, Flower, Invoice, Payment, StockEntry } = require('../models/mongoModels');

router.get('/', async (req, res) => {
  try {
    const cCount = await Customer.countDocuments();
    const fCount = await Flower.countDocuments();
    const iCount = await Invoice.countDocuments();
    
    // Total Sales
    const invs = await Invoice.find();
    const sales = invs.reduce((sum, i) => sum + i.total_amount, 0);
    
    // Total Credit
    const creditCusts = await Customer.find({ current_balance: { $lt: 0 } });
    const credit = creditCusts.reduce((sum, c) => sum + c.current_balance, 0);
    
    // Credits Cleared (Payments)
    const pays = await Payment.find();
    const cleared = pays.reduce((sum, p) => sum + p.amount, 0);

    const newOnes = await Customer.find().sort({ created_at: -1 }).limit(5);

    // Get stock out summary (requires aggregating invoices)
    const invoicesWithItems = await Invoice.find();
    let stockOutMap = {};
    invoicesWithItems.forEach(inv => {
      if (inv.items) {
        inv.items.forEach(itm => {
          if (!stockOutMap[itm.flower_name]) {
            stockOutMap[itm.flower_name] = { name: itm.flower_name, total_out: 0 };
          }
          stockOutMap[itm.flower_name].total_out += (itm.net_weight || 0);
        });
      }
    });
    const stockOut = Object.values(stockOutMap);

    const newStock = await StockEntry.find().sort({ entry_date: -1 }).limit(5);

    res.json({
      customers: cCount,
      flowers: fCount,
      invoices: iCount,
      totalSales: sales,
      totalCredit: Math.abs(credit),
      creditsCleared: cleared,
      newCustomers: newOnes,
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
    // Basic payment history from mongo
    const payments = await Payment.find().sort({ payment_date: -1 });
    
    // Populate customer names manually if no ObjectId ref was used
    const customerIds = [...new Set(payments.map(p => p.customer_id))];
    const customers = await Customer.find({ _id: { $in: customerIds } });
    
    const customerMap = {};
    customers.forEach(c => {
      customerMap[c._id.toString()] = c;
    });

    const enrichedPayments = payments.map(p => {
      const cust = customerMap[p.customer_id] || {};
      return {
        ...p.toObject(),
        customer_name: cust.name || 'Unknown',
        customer_name_ta: cust.name_ta || ''
      };
    });

    res.json(enrichedPayments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
