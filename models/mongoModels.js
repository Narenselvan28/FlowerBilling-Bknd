const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
});

const CustomerSchema = new mongoose.Schema({
  sqlId: Number, // To track sync
  name: { type: String, required: true },
  name_ta: String,
  phone: String,
  current_balance: { type: Number, default: 0.00 },
  created_at: { type: Date, default: Date.now }
});

const FlowerSchema = new mongoose.Schema({
  sqlId: Number,
  name: { type: String, required: true },
  name_ta: String,
  default_rate: { type: Number, required: true },
  unit: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const InvoiceItemSchema = new mongoose.Schema({
  flower_id: Number, // Reference to Flower SQL ID or Mongo ID
  flower_name: String,
  gross_weight: Number,
  less_weight: Number,
  net_weight: Number,
  rate: Number,
  amount: Number
});

const InvoiceSchema = new mongoose.Schema({
  sqlId: Number,
  customer_id: Number,
  customer_name: String,
  total_amount: { type: Number, required: true },
  previous_balance: { type: Number, required: true },
  final_balance: { type: Number, required: true },
  items: [InvoiceItemSchema],
  created_at: { type: Date, default: Date.now }
});

const PaymentSchema = new mongoose.Schema({
  sqlId: Number,
  customer_id: Number,
  amount: { type: Number, required: true },
  payment_date: { type: Date, default: Date.now }
});

const StockEntrySchema = new mongoose.Schema({
  sqlId: Number,
  flower_id: Number,
  quantity: { type: Number, required: true },
  entry_date: { type: Date, default: Date.now }
});

const ExpenseSchema = new mongoose.Schema({
  sqlId: Number,
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
