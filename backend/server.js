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
const { processExistingUploads } = require('./services/videoProcessingService');

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
const executiveTeamRoutes = require('./routes/executiveTeamRoutes');
const productRoutes = require('./routes/productRoutes');
const pharmacovigilanceRoutes = require('./routes/pharmacovigilanceRoutes');
const homeFacilityRoutes = require('./routes/homeFacilityRoutes');
const homePageRoutes = require('./routes/homePageRoutes');
const manufacturingPlatformRoutes = require('./routes/manufacturingPlatformRoutes');
const brandingRoutes = require('./routes/brandingRoutes');
const sectionHeadingsRoutes = require('./routes/sectionHeadingsRoutes');

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
// Use a custom streaming handler for video files so Safari / iOS receives
// proper HTTP 206 Partial Content responses (Range request support).
function serveWithRangeSupport(uploadsRoot) {
  return (req, res, next) => {
    const safeName = path.basename(req.path);
    const filePath = path.join(uploadsRoot, safeName);
    const ext = path.extname(safeName).toLowerCase();
    const isVideo = ['.mp4', '.webm', '.mov', '.ogg'].includes(ext);

    if (!isVideo) return next(); // let express.static handle images/pdfs

    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) return next();

      const fileSize = stat.size;
      const rangeHeader = req.headers['range'];

      const mimeMap = { '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.ogg': 'video/ogg' };
      const contentType = mimeMap[ext] || 'video/mp4';

      if (rangeHeader) {
        // Parse "bytes=start-end"
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        const headers = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        };
        res.writeHead(206, headers);
        fs.createReadStream(filePath, { start, end }).pipe(res);
      } else {
        // Full file request — still advertise Range support
        const headers = {
          'Content-Length': fileSize,
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400',
        };
        res.writeHead(200, headers);
        fs.createReadStream(filePath).pipe(res);
      }
    });
  };
}

const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', serveWithRangeSupport(uploadsDir));
app.use('/uploads', express.static(uploadsDir));
apiRouter.use('/uploads', serveWithRangeSupport(uploadsDir));
apiRouter.use('/uploads', express.static(uploadsDir));

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
apiRouter.use('/executive-team', executiveTeamRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/pharmacovigilance', pharmacovigilanceRoutes);
apiRouter.use('/home-facilities', homeFacilityRoutes);
apiRouter.use('/home-page', homePageRoutes);
apiRouter.use('/manufacturing-platform', manufacturingPlatformRoutes);
apiRouter.use('/branding', brandingRoutes);
apiRouter.use('/section-headings', sectionHeadingsRoutes);

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

// After DB init, run fast-start processing on existing MP4 uploads
// (background task — does not block server startup)
setTimeout(() => {
  processExistingUploads(path.join(__dirname, 'uploads')).catch(e =>
    console.warn('[FastStart] Startup scan error:', e.message)
  );
}, 5000);
