const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const BACKUP_DIR = path.join(__dirname, '../backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

// @desc    Trigger a manual database backup
// @route   POST /api/admin/backups
// @access  Private/Admin
const createBackup = (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);
  const dbName = process.env.PG_DATABASE || 'drive_hub';
  const dbUser = process.env.PG_USER || 'postgres';

  const command = `pg_dump -U ${dbUser} -h ${process.env.PG_HOST || 'localhost'} -p ${process.env.PG_PORT || 5432} -d ${dbName} -F c -f "${backupFile}"`;

  exec(command, { env: { ...process.env, PGPASSWORD: process.env.PG_PASSWORD } }, (error, stdout, stderr) => {
    if (error) {
      console.error(`[createBackup] error: ${error.message}`);
      return res.status(500).json({ message: 'Backup failed', error: error.message });
    }
    res.status(200).json({ message: 'Backup created successfully', file: `backup-${timestamp}.sql` });
  });
};

// @desc    Get list of backups
// @route   GET /api/admin/backups
// @access  Private/Admin
const getBackups = (req, res) => {
  fs.readdir(BACKUP_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to read backups directory' });
    }
    const backups = files.filter(f => f.endsWith('.sql')).map(file => {
      const stats = fs.statSync(path.join(BACKUP_DIR, file));
      return { file, size: stats.size, createdAt: stats.birthtime };
    });
    res.status(200).json(backups);
  });
};

module.exports = { createBackup, getBackups };
