const express = require('express');
const cors = require('cors');
const path = require('path');
let morgan;
try {
  morgan = require('morgan');
} catch (e) {
  // morgan optional in production
}
require('dotenv').config();

const { initDatabase } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const contactRoutes = require('./routes/contactRoutes');
const careerRoutes = require('./routes/careerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const productRoutes = require('./routes/productRoutes');
const pharmacovigilanceRoutes = require('./routes/pharmacovigilanceRoutes');
const homeFacilityRoutes = require('./routes/homeFacilityRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Angular frontend & external clients
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*'],
  exposedHeaders: ['Authorization']
}));

// Explicit preflight and CORS header fallback for Passenger / Apache
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Body Parsers
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
if (morgan) {
  app.use(morgan('dev'));
}

// Create unified API router
const apiRouter = express.Router();

// Static uploads directory (served on /uploads and /api/uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
apiRouter.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'VIC Biotech API Server is running.', timestamp: new Date() });
});

// API Routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/news', newsRoutes);
apiRouter.use('/media', mediaRoutes);
apiRouter.use('/contacts', contactRoutes);
apiRouter.use('/careers', careerRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/partners', partnerRoutes);
apiRouter.use('/about', aboutRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/pharmacovigilance', pharmacovigilanceRoutes);
apiRouter.use('/home-facilities', homeFacilityRoutes);

// Mount under both /api and / for seamless cPanel passenger sub-path compatibility
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server immediately so Passenger connects, then init DB
const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  VIC API Server running on port ${PORT}`);
  console.log(`  API Base: http://localhost:${PORT}/api`);
  console.log(`=========================================`);
});

initDatabase().catch(err => {
  console.error('[DB Init Warning]', err.message);
});
