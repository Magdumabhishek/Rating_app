// routes/owner.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Middleware: only accessible to owners
router.use(authenticateToken, authorizeRoles('owner'));


router.post('/store', async (req, res) => {
  const { name, email, address } = req.body;
  const ownerId = req.user.id;

  if (!name || !email || !address) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM stores WHERE owner_id = ?', [ownerId]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'You already have a store' });
    }

    await db.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, ownerId]
    );

    res.status(201).json({ message: 'Store created successfully' });
  } catch (err) {
    console.error('Error creating store:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




// Route: Get store info for the logged-in owner
router.get('/my-store', async (req, res) => {
  try {
    const [stores] = await db.query(
      'SELECT * FROM stores WHERE owner_id = ?',
      [req.user.id]
    );
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    res.json(stores[0]);
  } catch (err) {
    console.error('Error fetching owner store:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
