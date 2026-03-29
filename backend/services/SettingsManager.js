const pool = require('../config/pgPool');

class SettingsManager {
  constructor() {
    this.cache = {};
    this.isLoaded = false;
  }

  async loadSettings() {
    try {
      const { rows } = await pool.query('SELECT config_key, config_value FROM app_settings');
      this.cache = rows.reduce((acc, row) => {
        acc[row.config_key] = row.config_value;
        return acc;
      }, {});
      this.isLoaded = true;
      console.log('[SettingsManager] Global settings loaded into memory.');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error('[SettingsManager] Connection refused. Please ensure PostgreSQL is running.');
      } else {
        console.error('[SettingsManager] Error loading settings:', error.message || error);
      }
    }
  }

  getSetting(key, defaultValue = null) {
    if (!this.isLoaded) {
      console.warn(`[SettingsManager] Warning: Settings not fully loaded yet. Falling back to default for ${key}.`);
      return defaultValue;
    }
    return this.cache.hasOwnProperty(key) ? this.cache[key] : defaultValue;
  }

  async updateSetting(key, value, adminId) {
    const oldValue = this.cache[key];
    
    try {
      await pool.query(
        `INSERT INTO app_settings (config_key, config_value, updated_by, updated_at) 
         VALUES ($1, $2, $3, NOW()) 
         ON CONFLICT (config_key) 
         DO UPDATE SET config_value = EXCLUDED.config_value, updated_by = EXCLUDED.updated_by, updated_at = NOW()`,
        [key, value, adminId]
      );

      await pool.query(
        `INSERT INTO audit_logs (action_type, performed_by, details) 
         VALUES ('UPDATE_SETTING', $1, $2)`,
        [adminId, { key, old_value: oldValue, new_value: value }]
      );

      this.cache[key] = value;
      return true;
    } catch (error) {
      console.error(`[SettingsManager] Failed to update ${key}:`, error.message);
      throw new Error(`Failed to update setting ${key}`);
    }
  }
}

module.exports = new SettingsManager();
