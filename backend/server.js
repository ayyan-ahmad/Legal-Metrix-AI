const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LegalMetrix AI backend is running' });
});

const PORT =  5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});