const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const reset = async () => {
  try {
    console.log('--- Starting Database Reset ---');

    // 1. Reset MySQL
    console.log('Resetting MySQL...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '0000',
      multipleStatements: true
    });

    const dbName = process.env.DB_NAME || 'flower_billing';
    await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);
    await connection.query(`CREATE DATABASE ${dbName}`);
    await connection.query(`USE ${dbName}`);

    // Create Schema
    const schema = `
      CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'admin'
      );

      CREATE TABLE customers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          name_ta VARCHAR(100),
          phone VARCHAR(15),
          current_balance DECIMAL(10, 2) DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE flowers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          name_ta VARCHAR(100),
          default_rate DECIMAL(10, 2) NOT NULL,
          unit VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE invoices (
          id INT AUTO_INCREMENT PRIMARY KEY,
          customer_id INT,
          total_amount DECIMAL(10, 2) NOT NULL,
          previous_balance DECIMAL(10, 2) NOT NULL,
          final_balance DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers(id)
      );

      CREATE TABLE invoice_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          invoice_id INT,
          flower_id INT,
          gross_weight DECIMAL(10, 3) NOT NULL,
          less_weight DECIMAL(10, 3) NOT NULL,
          net_weight DECIMAL(10, 3) NOT NULL,
          rate DECIMAL(10, 2) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
          FOREIGN KEY (flower_id) REFERENCES flowers(id)
      );

      CREATE TABLE payments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          customer_id INT,
          amount DECIMAL(10, 2) NOT NULL,
          payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers(id)
      );

      CREATE TABLE stock_entries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          flower_id INT,
          quantity DECIMAL(10, 3) NOT NULL,
          entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (flower_id) REFERENCES flowers(id)
      );

      CREATE TABLE expenses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          type VARCHAR(100) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          note TEXT,
          date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO users (username, password) VALUES ('admin', 'admin123');
    `;

    await connection.query(schema);
    console.log('MySQL Schema Created.');

    // Seed Data
    const flowers = [
      ['Malli (Jasmine)', 'மல்லிகை', 450.00, 'kg'],
      ['Rose (Red)', 'ரோஜா', 120.00, 'kg'],
      ['Marigold (Yellow)', 'சாமந்தி', 80.00, 'kg'],
      ['Lily (White)', 'லில்லி', 250.00, 'kg'],
      ['Lotus', 'தாமரை', 40.00, 'kg'],
      ['Button Rose', 'பட்டன் ரோஸ்', 180.00, 'kg'],
      ['Tulip', 'டியூலிப்', 500.00, 'kg'],
      ['Jamanthi', 'ஜெமந்தி', 150.00, 'kg']
    ];

    for (const f of flowers) {
      await connection.query('INSERT INTO flowers (name, name_ta, default_rate, unit) VALUES (?, ?, ?, ?)', f);
    }

    const customers = [
      ['Anand Flower Shop', 'ஆனந்த் பூக்கடை', '9845012345', 0.00],
      ['Balaji Traders', 'பாலாஜி டிரேடர்ஸ்', '9740055667', 0.00],
      ['Cauvery Florals', 'காவேரி ஃப்ளோரல்ஸ்', '9900112233', 0.00],
      ['Eswari Malar Nilayam', 'ஈஸ்வரி மலர் நிலையம்', '9448011223', 0.00]
    ];

    for (const c of customers) {
      await connection.query('INSERT INTO customers (name, name_ta, phone, current_balance) VALUES (?, ?, ?, ?)', c);
    }

    const sampleExpenses = [
      ['Rent', 5000.00, 'Monthly shop rent', new Date()],
      ['Electricity', 1200.00, 'Electricity bill', new Date()],
      ['Labor', 3000.00, 'Daily wages for help', new Date()],
      ['Transport', 850.00, 'Fuel and freight', new Date()]
    ];

    for (const e of sampleExpenses) {
      await connection.query('INSERT INTO expenses (type, amount, note, date) VALUES (?, ?, ?, ?)', e);
    }

    const samplePayments = [
      [1, 500.00, new Date()],
      [2, 1000.00, new Date()],
      [3, 250.00, new Date()]
    ];

    for (const p of samplePayments) {
      await connection.query('INSERT INTO payments (customer_id, amount, payment_date) VALUES (?, ?, ?)', p);
    }

    console.log('MySQL Data Seeded.');
    await connection.end();

    // 2. Reset MongoDB
    console.log('Resetting MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/flower_billing';
    await mongoose.connect(mongoUri);
    await mongoose.connection.dropDatabase();
    console.log('MongoDB Database Dropped.');
    await mongoose.disconnect();

    console.log('--- Reset Complete Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Reset Failed:', err);
    process.exit(1);
  }
};

reset();
