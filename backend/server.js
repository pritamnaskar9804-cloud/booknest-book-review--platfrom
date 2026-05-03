/**
 * BookNest — Express Server
 * Designed & Developed by Pritam Naskar (Rehan'Z Digital Network)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// ── Routes ─────────────────────────────────────────────────
const authRoutes   = require('./routes/auth');
const bookRoutes   = require('./routes/books');
const reviewRoutes = require('./routes/reviews');
const userRoutes   = require('./routes/users');

const app = express();

// ── Database ────────────────────────────────────────────────
connectDB();

// ── Rate Limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/api', limiter);

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/books',   bookRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users',   userRoutes);

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BookNest API is running',
    version: '1.0.0',
    author: 'Pritam Naskar — Rehan\'Z Digital Network',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 BookNest API running on http://localhost:${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV}`);
  console.log(`✨ By Pritam Naskar — Rehan'Z Digital Network\n`);
});
