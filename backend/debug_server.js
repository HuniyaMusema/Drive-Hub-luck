require('dotenv').config();
console.log('1: Dotenv loaded');
const express = require('express');
console.log('2: Express required');
const cors = require('cors');
console.log('3: Cors required');
const SettingsManager = require('./services/SettingsManager');
console.log('4: SettingsManager required');
const { maintenanceGuard } = require('./middleware/systemGuards');
console.log('5: MaintenanceGuard required');

const path = require('path');
console.log('6: Path required');

const app = express();
console.log('7: App instance created');

// Load settings on startup
console.log('8: Loading settings...');
SettingsManager.loadSettings().then(() => {
  console.log('9: Settings loaded callback');
});

// Middleware
console.log('10: Setting up middleware...');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Master Platform Toggle
console.log('11: Setting up guards...');
app.use(maintenanceGuard);

// Routes
console.log('12: Setting up routes...');
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

console.log('13: Routes configured');

const PORT = process.env.PORT || 5000;
console.log(`14: Port is ${PORT}`);

console.log('15: Calling app.listen...');
app.listen(PORT, (err) => {
  if (err) {
    console.error('16: Server failed to start', err);
    return;
  }
  console.log(`17: Server is running on port ${PORT}`);
});
