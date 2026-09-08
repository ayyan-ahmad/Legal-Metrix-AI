const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const uploadRoutes = require('./src/routes/upload');
const aiRoutes = require('./src/routes/aiRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LegalMetrix AI backend is running' });
});

const PORT =  5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});