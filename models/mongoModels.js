const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
});

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  name_ta: String,
  phone: String,
  current_balance: { type: Number, default: 0.00 },
  created_at: { type: Date, default: Date.now }
});

const FlowerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  name_ta: String,
  default_rate: { type: Number, required: true },
  unit: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const InvoiceItemSchema = new mongoose.Schema({
  flower_id: String, // String to hold Mongo ObjectId
  flower_name: String,
  gross_weight: Number,
  less_weight: Number,
  net_weight: Number,
  rate: Number,
  amount: Number
});

const InvoiceSchema = new mongoose.Schema({
  customer_id: String, // String to hold Mongo ObjectId
  customer_name: String,
  payment_mode: { type: String, default: 'Credit' },
  total_amount: { type: Number, required: true },
  amount_paid: { type: Number, default: 0 },
  previous_balance: { type: Number, required: true },
  final_balance: { type: Number, required: true },
  items: [InvoiceItemSchema],
  created_at: { type: Date, default: Date.now }
});

const PaymentSchema = new mongoose.Schema({
  customer_id: String, // String to hold Mongo ObjectId
  amount: { type: Number, required: true },
  payment_date: { type: Date, default: Date.now }
});

const StockEntrySchema = new mongoose.Schema({
  flower_id: String, // String to hold Mongo ObjectId
  quantity: { type: Number, required: true },
  entry_date: { type: Date, default: Date.now }
});

const ExpenseSchema = new mongoose.Schema({
  type: String,
  amount: Number,
  note: String,
  date: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Customer: mongoose.model('Customer', CustomerSchema),
  Flower: mongoose.model('Flower', FlowerSchema),
  Invoice: mongoose.model('Invoice', InvoiceSchema),
  Payment: mongoose.model('Payment', PaymentSchema),
  StockEntry: mongoose.model('StockEntry', StockEntrySchema),
  Expense: mongoose.model('Expense', ExpenseSchema)
};
