const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Protect all routes for normal users
router.use(authenticateToken, authorizeRoles('user'));

// 1. View all stores with ratings
router.get('/stores', async (req, res) => {
  try {
    const userId = req.user.id;

    const [stores] = await db.query(`
  SELECT s.id, s.name, s.email, s.address,
         IFNULL(ROUND(AVG(r.rating), 1), 0.0) AS rating,
         (
           SELECT rating FROM ratings
           WHERE ratings.user_id = ?
           AND ratings.store_id = s.id
           LIMIT 1
         ) AS user_rating
  FROM stores s
  LEFT JOIN ratings r ON s.id = r.store_id
  GROUP BY s.id
`, [req.user.id]);


    res.json(stores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not fetch store list' });
  }
});

// 2. Submit or update rating
router.post('/rate', async (req, res) => {
  const { store_id, rating } = req.body;
  const user_id = req.user.id;

  if (!store_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Invalid store ID or rating value' });
  }

  try {
    // Insert or update rating
    await db.query(`
      INSERT INTO ratings (store_id, user_id, rating)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE rating = ?
    `, [store_id, user_id, rating, rating]);

    res.status(200).json({ message: 'Rating submitted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting rating' });
  }
});

module.exports = router;
