const SettingsManager = require('../services/SettingsManager');
const pool = require('../config/pgPool');

// @desc    Get all settings
// @route   GET /api/settings
// @access  Public (for UI to read global configs)
const getSettings = (req, res) => {
  res.json(SettingsManager.cache);
};

// @desc    Update a setting
// @route   PUT /api/settings/:key
// @access  Private/Admin
const updateSetting = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  
  if (value === undefined) {
    return res.status(400).json({ message: 'Value is required' });
  }

  try {
    await SettingsManager.updateSetting(key, value, req.user.id);
    res.status(200).json({ key, value });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public stats (counts)
// @route   GET /api/settings/stats
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    const carsCount = await pool.query("SELECT COUNT(*) FROM cars");
    const usersCount = await pool.query("SELECT COUNT(*) FROM users");
    const lotteryCount = await pool.query("SELECT COUNT(*) FROM lottery_numbers");
    
    res.json({
      vehicles: parseInt(carsCount.rows[0].count) || 0,
      happyClients: (parseInt(usersCount.rows[0].count) || 0) + 120, // Add a base offset for realism
      lotteryDraws: (parseInt(lotteryCount.rows[0].count) || 0) + 5
    });
  } catch (error) {
    console.error('[getPublicStats]', error.message);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

module.exports = { getSettings, updateSetting, getPublicStats };
