const mongoose = require('mongoose');

const transform = {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
};

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' }
}, { toJSON: transform, toObject: transform });

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  name_ta: String,
  phone: String,
  current_balance: { type: Number, default: 0.00 },
  created_at: { type: Date, default: Date.now }
}, { toJSON: transform, toObject: transform });

const FlowerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  name_ta: String,
  default_rate: { type: Number, required: true },
  unit: { type: String, required: true },
  stock_qty: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
}, { toJSON: transform, toObject: transform });

const InvoiceItemSchema = new mongoose.Schema({
  flower_id: String, 
  flower_name: String,
  gross_weight: Number,
  less_weight: Number,
  net_weight: Number,
  rate: Number,
  amount: Number
}, { toJSON: transform, toObject: transform });

const InvoiceSchema = new mongoose.Schema({
  customer_id: String,
  customer_name: String,
  total_amount: { type: Number, required: true },
  previous_balance: { type: Number, required: true },
  final_balance: { type: Number, required: true },
  payment_mode: { type: String, default: 'Credit' },
  amount_paid: { type: Number, default: 0 },
  items: [InvoiceItemSchema],
  created_at: { type: Date, default: Date.now }
}, { toJSON: transform, toObject: transform });

const PaymentSchema = new mongoose.Schema({
  customer_id: String,
  amount: { type: Number, required: true },
  note: String,
  payment_date: { type: Date, default: Date.now }
}, { toJSON: transform, toObject: transform });

const StockEntrySchema = new mongoose.Schema({
  flower_id: String,
  quantity: { type: Number, required: true },
  note: String,
  entry_date: { type: Date, default: Date.now }
}, { toJSON: transform, toObject: transform });

const ExpenseSchema = new mongoose.Schema({
  type: String,
  amount: Number,
  note: String,
  date: { type: Date, default: Date.now }
}, { toJSON: transform, toObject: transform });

module.exports = {
  User: mongoose.model('User', UserSchema),
  Customer: mongoose.model('Customer', CustomerSchema),
  Flower: mongoose.model('Flower', FlowerSchema),
  Invoice: mongoose.model('Invoice', InvoiceSchema),
  Payment: mongoose.model('Payment', PaymentSchema),
  StockEntry: mongoose.model('StockEntry', StockEntrySchema),
  Expense: mongoose.model('Expense', ExpenseSchema)
};
