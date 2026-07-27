require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectMongo } = require('./db/mongo');

const app = express();
const port = process.env.PORT || 5000;

// Initialize MongoDB connection
connectMongo().then(connected => {
  if (connected) {
    console.log('Main server connected to MongoDB');
  } else {
    console.error('Main server FAILED to connect to MongoDB');
  }
});

app.use(cors());
app.use(bodyParser.json());

// basic routes
app.use('/api', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/flowers', require('./routes/flowers'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/expenses', require('./routes/expenses'));

// Comprehensive Health Check Endpoint
app.get('/health', (req, res) => {
  const os = require('os');
  const mongoose = require('mongoose');

  const healthData = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: {
      process: Math.floor(process.uptime()) + 's',
      os: Math.floor(os.uptime()) + 's'
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      node_version: process.version,
      cpu_count: os.cpus().length,
      free_memory: (os.freemem() / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      total_memory: (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2) + ' GB',
      load_average: os.loadavg()
    },
    process: {
      pid: process.pid,
      memory_usage: {
        rss: (process.memoryUsage().rss / (1024 * 1024)).toFixed(2) + ' MB',
        heap_total: (process.memoryUsage().heapTotal / (1024 * 1024)).toFixed(2) + ' MB',
        heap_used: (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2) + ' MB'
      }
    },
    database: {
      mongodb: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
      readyState: mongoose.connection.readyState
    },
    env: process.env.NODE_ENV || 'development'
  };

  res.json(healthData);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server started on port ${port}`);
});
