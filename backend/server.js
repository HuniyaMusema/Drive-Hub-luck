const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: false });

const express = require('express');
const cors = require('cors');
const SettingsManager = require('./services/SettingsManager');
const { maintenanceGuard } = require('./middleware/systemGuards');
const ReminderJob = require('./jobs/reminderJob');
const AutoPaymentJob = require('./jobs/autoPaymentJob');

const app = express();

// Load settings on startup, then start background jobs
SettingsManager.loadSettings().then(() => {
  ReminderJob.start();
  AutoPaymentJob.start();
}).catch((err) => {
  console.error('[server] Failed to load settings:', err.message);
  ReminderJob.start();
  AutoPaymentJob.start();
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

// Middleware
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  ...(process.env.ADDITIONAL_ORIGINS ? process.env.ADDITIONAL_ORIGINS.split(',') : [])
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Master Platform Toggle
app.use(maintenanceGuard);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cars', require('./routes/carRoutes'));
app.use('/api/lottery', require('./routes/lotteryRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Admin routes (PostgreSQL-backed)
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin/lottery', require('./routes/adminLotteryRoutes'));
app.use('/api/admin/backups', require('./routes/backupRoutes'));
app.use('/api/admin/logs', require('./routes/auditLogsRoutes'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Drive-Hub API' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Drive-Hub backend is running',
    time: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
