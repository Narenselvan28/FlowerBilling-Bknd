require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectMongo } = require('./mongo');
const { Flower, Customer, User, Invoice, Payment, StockEntry, Expense } = require('../models/mongoModels');

const seed = async () => {
  try {
    console.log('Starting MongoDB seeding...');
    await connectMongo();

    // 0. Clear existing data
    console.log('Clearing all existing data...');
    await Flower.deleteMany({});
    await Customer.deleteMany({});
    await User.deleteMany({});
    await Invoice.deleteMany({});
    await Payment.deleteMany({});
    await StockEntry.deleteMany({});
    await Expense.deleteMany({});

    // 1. Seed Flowers
    const flowers = [
      { name: 'Malli (Jasmine)', name_ta: 'மல்லிகை', default_rate: 450.00, unit: 'kg', stock_qty: 100 },
      { name: 'Rose (Red)', name_ta: 'ரோஜா', default_rate: 120.00, unit: 'bundle', stock_qty: 50 },
      { name: 'Marigold (Yellow)', name_ta: 'சாமந்தி', default_rate: 80.00, unit: 'kg', stock_qty: 200 },
      { name: 'Lily (White)', name_ta: 'லில்லி', default_rate: 250.00, unit: 'bundle', stock_qty: 30 },
      { name: 'Lotus', name_ta: 'தாமரை', default_rate: 40.00, unit: 'bundle', stock_qty: 100 },
      { name: 'Button Rose', name_ta: 'பட்டன் ரோஸ்', default_rate: 180.00, unit: 'kg', stock_qty: 80 },
      { name: 'Tulip', name_ta: 'டியூலிப்', default_rate: 500.00, unit: 'bundle', stock_qty: 20 },
      { name: 'Jamanthi', name_ta: 'ஜெமந்தி', default_rate: 150.00, unit: 'kg', stock_qty: 120 }
    ];

    console.log('Seeding flowers...');
    await Flower.insertMany(flowers);

    // 2. Seed Customers
    const customers = [
      { name: 'Anand Flower Shop', name_ta: 'ஆனந்த் பூக்கடை', phone: '9845012345', current_balance: 1500.50 },
      { name: 'Balaji Traders', name_ta: 'பாலாஜி டிரேடர்ஸ்', phone: '9740055667', current_balance: 0.00 },
      { name: 'Cauvery Florals', name_ta: 'காவேரி ஃப்ளோரல்ஸ்', phone: '9900112233', current_balance: 4500.00 },
      { name: 'Deepak Flowers', name_ta: 'தீபக் பூக்கள்', phone: '9880099887', current_balance: -200.00 },
      { name: 'Eswari Malar Nilayam', name_ta: 'ஈஸ்வரி மலர் நிலையம்', phone: '9448011223', current_balance: 12500.00 },
      { name: 'Farmers Market - Raja', name_ta: 'உழவர் சந்தை - ராஜா', phone: '9663344556', current_balance: 0.00 },
      { name: 'Ganesh & Sons', name_ta: 'கணேஷ் & சன்ஸ்', phone: '9552233441', current_balance: 3200.75 }
    ];

    console.log('Seeding customers...');
    await Customer.insertMany(customers);

    // 3. Seed Admin User
    console.log('Seeding admin user...');
    await User.create({ username: 'admin', password: 'admin123', role: 'admin' });

    console.log('MongoDB seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding MongoDB:', err);
    process.exit(1);
  }
};

seed();
