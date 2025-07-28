const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Apply both middleware to all admin routes
router.use(authenticateToken, authorizeRoles('admin'));

// 1. Admin Dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [[{ userCount }]] = await db.query("SELECT COUNT(*) AS userCount FROM users");
    const [[{ storeCount }]] = await db.query("SELECT COUNT(*) AS storeCount FROM stores");
    const [[{ ratingCount }]] = await db.query("SELECT COUNT(*) AS ratingCount FROM ratings");

    res.json({ userCount, storeCount, ratingCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard error" });
  }
});

// 2. View all users
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, name, email, address, role FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch users" });
  }
});

// 3. View all stores
router.get('/stores', async (req, res) => {
  try {
    const [stores] = await db.query(`
      SELECT s.id, s.name, s.email, s.address,
      ROUND(AVG(r.rating), 1) AS rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
    `);
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch stores" });
  }
});

router.post('/users', async (req, res) => {
  const { name, email, password, address, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, address, role]
    );

    res.status(201).json({ message: 'User added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding user' });
  }
});

router.post('/stores', async (req, res) => {
  const { name, email, address, owner_id } = req.body;

  if (!name || !address || !owner_id) {
    return res.status(400).json({ message: 'Name, address, and owner_id are required' });
  }

  try {
    // Check if owner exists and is actually a store owner
    const [owner] = await db.query('SELECT * FROM users WHERE id = ? AND role = "owner"', [owner_id]);
    if (owner.length === 0) {
      return res.status(400).json({ message: 'Invalid or non-store owner ID' });
    }

    await db.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id]
    );

    res.status(201).json({ message: 'Store added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding store' });
  }
});


module.exports = router;
