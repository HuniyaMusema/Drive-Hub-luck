try {
  console.log('Attempting to require authController...');
  const authController = require('./controllers/authController');
  console.log('Successfully required authController');
} catch (error) {
  console.error('FAILED to require authController');
  console.error('Error Code:', error.code);
  console.error('Error Message:', error.message);
  console.error('Stack Trace:', error.stack);
}
