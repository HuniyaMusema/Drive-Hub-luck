const pool = require('../config/pgPool');

class NotificationService {
  /**
   * Create a notification for a specific user
   * @param {string} userId - UUID of the user
   * @param {string} title - Notification title
   * @param {string} message - Notification details
   * @param {string} type - 'info', 'success', 'warning', 'error'
   */
  async createNotification(userId, title, message, type = 'info') {
    try {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
        [userId, title, message, type]
      );
      return true;
    } catch (error) {
      console.error('[NotificationService] Failed to create notification:', error.message);
      return false;
    }
  }

  /**
   * Notify all admins
   * @param {string} title 
   * @param {string} message 
   * @param {string} type 
   */
  async notifyAdmins(title, message, type = 'info') {
    try {
      const { rows: admins } = await pool.query("SELECT id FROM users WHERE role = 'admin'");
      for (const admin of admins) {
        await this.createNotification(admin.id, title, message, type);
      }
      return true;
    } catch (error) {
      console.error('[NotificationService] Failed to notify admins:', error.message);
      return false;
    }
  }
}

module.exports = new NotificationService();
