const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');
const ownerRoutes = require('./routes/owner');



const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));
app.use('/api/owner', ownerRoutes);



app.get('/', (req, res) => {
  res.send('API is working!');
});

// Placeholder for future route imports
// app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

console.log("Connected to DB:", process.env.DB_NAME);