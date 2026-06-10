require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');

const predictRoute = require('./routes/predict');

const app = express();

// ── Middleware ──
app.use(express.json());
app.use(morgan('combined'));   // FR-BE-05: Request Logging

// FR-BE-01: CORS — izinkan hanya dari domain frontend
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000'
];
app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (Postman, curl) saat development
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin '${origin}' tidak diizinkan oleh CORS`));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ── Routes ──
app.use('/api', predictRoute);

// ── Health check Node.js ──
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'node-gateway', version: '2.0.0' });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ error: `Route '${req.originalUrl}' tidak ditemukan` });
});

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Terjadi kesalahan pada server' });
});

// ── Start Server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Node.js Gateway berjalan di http://localhost:${PORT}`);
  console.log(`   FastAPI URL: ${process.env.FASTAPI_URL || 'http://localhost:8000'}`);
});
