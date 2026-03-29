const SettingsManager = require('../services/SettingsManager');

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

module.exports = { getSettings, updateSetting };
