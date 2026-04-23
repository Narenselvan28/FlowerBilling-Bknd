const express = require('express');
const router = express.Router();
const store = require('../db/dbManager');
const { User } = require('../models/mongoModels');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // try to find user in sql first, then fallback to mongo
    const users = await store.read(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      async () => await User.find({ username, password })
    );

    if (users && users.length > 0) {
      // return the first match
      const user = users[0];
      res.json({ 
        success: true, 
        user: { id: user.id || user._id, username: user.username } 
      });
    } else {
      res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }
  } catch (err) {
    console.log('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
