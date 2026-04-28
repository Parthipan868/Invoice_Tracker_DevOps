// ================== IMPORTS ==================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// ================== APP INIT ==================
const app = express();

// ================== ROUTES IMPORT ==================
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const invoiceRoutes = require('./routes/invoices');
const clientRoutes = require('./routes/clients');
const dashboardRoutes = require('./routes/dashboard');
const templateRoutes = require('./routes/templates');
const clientPortalRoutes = require('./routes/clientPortal');
const productRoutes = require('./routes/products');
const clientSignupRoutes = require('./routes/clientSignup');

// ================== SECURITY ==================
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// ================== CORS ==================
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ================== BODY PARSER ==================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ================== DATABASE ==================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ================== API ROUTES ==================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/client-portal', clientPortalRoutes);
app.use('/api/products', productRoutes);
app.use('/api', clientSignupRoutes);

// ================== HEALTH CHECK ==================
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

// ================== 404 HANDLER ==================
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ================== ERROR HANDLER ==================
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ================== START SERVER ==================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;