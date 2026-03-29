require('dotenv').config();
const express = require('express');
const cors = require('cors');
const SettingsManager = require('./services/SettingsManager');
const { maintenanceGuard } = require('./middleware/systemGuards');

const app = express();

// Load settings on startup
SettingsManager.loadSettings();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
