require('dotenv').config();
const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const { User, Customer, Flower, Invoice, Payment, Expense, StockEntry } = require('../models/mongoModels');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flower_billing';

const migrate = async () => {
  try {
    console.log('Starting migration from SQL to MongoDB...');
    
    // 1. Connect to both
    const sql = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '0000',
      database: process.env.DB_NAME || 'flower_billing'
    });
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to both databases.');

    // 2. Clear MongoDB (Optional, but safer for a full copy)
    // console.log('Clearing existing Mongo data...');
    // await Customer.deleteMany({});
    // ...

    // 3. Migrate Users
    console.log('Migrating Users...');
    const [users] = await sql.query('SELECT * FROM users');
    for (const u of users) {
      await User.updateOne(
        { username: u.username },
        { password: u.password, role: u.role },
        { upsert: true }
      );
    }

    // 4. Migrate Flowers
    console.log('Migrating Flowers...');
    const [flowers] = await sql.query('SELECT * FROM flowers');
    for (const f of flowers) {
      await Flower.updateOne(
        { sqlId: f.id },
        { name: f.name, name_ta: f.name_ta, default_rate: f.default_rate, unit: f.unit, created_at: f.created_at },
        { upsert: true }
      );
    }

    // 5. Migrate Customers
    console.log('Migrating Customers...');
    const [customers] = await sql.query('SELECT * FROM customers');
    for (const c of customers) {
      await Customer.updateOne(
        { sqlId: c.id },
        { name: c.name, name_ta: c.name_ta, phone: c.phone, current_balance: c.current_balance, created_at: c.created_at },
        { upsert: true }
      );
    }

    // 6. Migrate Invoices & Items
    console.log('Migrating Invoices...');
    const [invoices] = await sql.query('SELECT * FROM invoices');
    for (const inv of invoices) {
      const [items] = await sql.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [inv.id]);
      await Invoice.updateOne(
        { sqlId: inv.id },
        { 
          customer_id: inv.customer_id,
          total_amount: inv.total_amount,
          previous_balance: inv.previous_balance,
          final_balance: inv.final_balance,
          created_at: inv.created_at,
          items: items.map(i => ({
            flower_id: i.flower_id,
            gross_weight: i.gross_weight,
            less_weight: i.less_weight,
            net_weight: i.net_weight,
            rate: i.rate,
            amount: i.amount
          }))
        },
        { upsert: true }
      );
    }

    // 7. Migrate Payments
    console.log('Migrating Payments...');
    const [payments] = await sql.query('SELECT * FROM payments');
    for (const p of payments) {
      await Payment.updateOne(
        { sqlId: p.id },
        { customer_id: p.customer_id, amount: p.amount, payment_date: p.payment_date },
        { upsert: true }
      );
    }

    // 8. Migrate Expenses
    console.log('Migrating Expenses...');
    try {
      const [expenses] = await sql.query('SELECT * FROM expenses');
      for (const e of expenses) {
        await Expense.updateOne(
          { sqlId: e.id },
          { type: e.type, amount: e.amount, note: e.note, date: e.date },
          { upsert: true }
        );
      }
    } catch (e) {
      console.log('Expenses table might not exist yet, skipping.');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
