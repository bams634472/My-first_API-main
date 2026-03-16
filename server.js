require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');
const swaggerUi    = require('swagger-ui-express');
const swaggerSpec  = require('./src/swagger');

const authRoutes      = require('./src/routes/auth');
const countriesRoutes = require('./src/routes/countries');
const citiesRoutes    = require('./src/routes/cities');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Rate limiter: 100 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  message: { error: 'Too many requests, please try again later.' },
}));

// ── Swagger Docs ───────────────────────────────────────────────────────────────
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Countries API Docs',
}));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/countries', countriesRoutes);
app.use('/api/cities',    citiesRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📖 Swagger docs at http://localhost:${PORT}/docs`);
});

module.exports = app;