const express = require('express');
const router = express.Router();
const { User } = require('../models/mongoModels');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username, password });

    if (user) {
      res.json({ 
        success: true, 
        user: { id: user._id, username: user.username } 
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
