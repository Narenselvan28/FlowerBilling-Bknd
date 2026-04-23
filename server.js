require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectMongo } = require('./db/mongo');

const app = express();
const port = process.env.PORT || 8080;

// connect to backup db
connectMongo();

app.use(cors());
app.use(bodyParser.json());

// basic routes
app.use('/api', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/flowers', require('./routes/flowers'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/health', require('./routes/health'));

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
