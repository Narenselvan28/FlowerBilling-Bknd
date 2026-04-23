const db = require('./connection');

const seed = async () => {
  try {
    console.log('Starting database seeding...');

    // 1. Seed Flowers with Tamil names
    const flowers = [
      ['Malli (Jasmine)', 'மல்லிகை', 450.00, 'kg'],
      ['Rose (Red)', 'ரோஜா', 120.00, 'bundle'],
      ['Marigold (Yellow)', 'சாமந்தி', 80.00, 'kg'],
      ['Lily (White)', 'லில்லி', 250.00, 'bundle'],
      ['Lotus', 'தாமரை', 40.00, 'bundle'],
      ['Button Rose', 'பட்டன் ரோஸ்', 180.00, 'kg'],
      ['Tulip', 'டியூலிப்', 500.00, 'bundle'],
      ['Jamanthi', 'ஜெமந்தி', 150.00, 'kg']
    ];

    console.log('Seeding flowers...');
    for (const flower of flowers) {
      await db.query('INSERT IGNORE INTO flowers (name, name_ta, default_rate, unit) VALUES (?, ?, ?, ?)', flower);
      // Also update existing ones if they don't have name_ta
      await db.query('UPDATE flowers SET name_ta = ? WHERE name = ?', [flower[1], flower[0]]);
    }

    // 2. Seed Customers with Tamil names
    const customers = [
      ['Anand Flower Shop', 'ஆனந்த் பூக்கடை', '9845012345', 1500.50],
      ['Balaji Traders', 'பாலாஜி டிரேடர்ஸ்', '9740055667', 0.00],
      ['Cauvery Florals', 'காவேரி ஃப்ளோரல்ஸ்', '9900112233', 4500.00],
      ['Deepak Flowers', 'தீபக் பூக்கள்', '9880099887', -200.00],
      ['Eswari Malar Nilayam', 'ஈஸ்வரி மலர் நிலையம்', '9448011223', 12500.00],
      ['Farmers Market - Raja', 'உழவர் சந்தை - ராஜா', '9663344556', 0.00],
      ['Ganesh & Sons', 'கணேஷ் & சன்ஸ்', '9552233441', 3200.75]
    ];

    console.log('Seeding customers...');
    for (const customer of customers) {
      await db.query('INSERT IGNORE INTO customers (name, name_ta, phone, current_balance) VALUES (?, ?, ?, ?)', customer);
      await db.query('UPDATE customers SET name_ta = ? WHERE name = ?', [customer[1], customer[0]]);
    }

    console.log('Database seeded with Tamil names successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seed();
