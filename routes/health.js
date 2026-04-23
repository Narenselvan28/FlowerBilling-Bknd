const express = require('express');
const router = express.Router();
const os = require('os');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  let mongoStatus = 'Disconnected';

  // Check MongoDB Connection
  const state = mongoose.connection.readyState;
  if (state === 0) mongoStatus = 'Disconnected';
  else if (state === 1) mongoStatus = 'Connected';
  else if (state === 2) mongoStatus = 'Connecting';
  else if (state === 3) mongoStatus = 'Disconnecting';
  else mongoStatus = 'Unknown';

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    uptime_formatted: `${Math.floor(process.uptime() / 60 / 60)}h ${Math.floor((process.uptime() / 60) % 60)}m ${Math.floor(process.uptime() % 60)}s`,
    environment: process.env.NODE_ENV || 'development',
    databases: {
      mongodb: mongoStatus
    },
    system: {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      total_memory: formatBytes(os.totalmem()),
      free_memory: formatBytes(os.freemem()),
      used_memory: formatBytes(os.totalmem() - os.freemem()),
      memory_usage_percentage: `${(((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2)}%`,
      cpus: os.cpus().length,
      cpu_model: os.cpus()[0]?.model || 'Unknown',
      load_average: os.loadavg()
    },
    process: {
      pid: process.pid,
      node_version: process.version,
      memory_usage: {
        rss: formatBytes(process.memoryUsage().rss),
        heapTotal: formatBytes(process.memoryUsage().heapTotal),
        heapUsed: formatBytes(process.memoryUsage().heapUsed),
        external: formatBytes(process.memoryUsage().external),
      }
    }
  };

  res.status(200).json(healthData);
});

module.exports = router;
