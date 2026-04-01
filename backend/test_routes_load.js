const routes = [
  './routes/authRoutes',
  './routes/carRoutes',
  './routes/lotteryRoutes',
  './routes/settingsRoutes',
  './routes/notificationRoutes',
  './routes/adminRoutes',
  './routes/adminLotteryRoutes',
  './routes/backupRoutes',
  './routes/auditLogsRoutes'
];

routes.forEach(route => {
  try {
    console.log(`Attempting to require ${route}...`);
    require(route);
    console.log(`Successfully required ${route}`);
  } catch (error) {
    console.error(`FAILED to require ${route}`);
    console.error('Error Message:', error.message);
    if (error.code === 'MODULE_NOT_FOUND') {
       console.error('Module missing error details:', error.stack);
    }
  }
});
