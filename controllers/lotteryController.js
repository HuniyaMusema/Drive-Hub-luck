const Lottery = require('../models/Lottery');
const crypto = require('crypto');

// @desc    Participate in the lottery
// @route   POST /api/lottery/participate
// @access  Private
const participateLottery = async (req, res) => {
  try {
    // Check if user already participated
    const existingEntry = await Lottery.findOne({ user: req.user.id });

    if (existingEntry) {
      return res.status(400).json({ message: 'You have already entered the lottery!' });
    }

    // Generate a unique ticket number
    const ticketNumber = crypto.randomBytes(4).toString('hex').toUpperCase();

    const lotteryEntry = await Lottery.create({
      user: req.user.id,
      ticketNumber,
      status: 'ACTIVE'
    });

    res.status(201).json(lotteryEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all lottery entries (Admin)
// @route   GET /api/lottery
// @access  Private/Admin
const getLotteryEntries = async (req, res) => {
  try {
    const entries = await Lottery.find({}).populate('user', 'name email');
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pick a winner
// @route   PUT /api/lottery/pick-winner
// @access  Private/Admin
const pickWinner = async (req, res) => {
  try {
    // Basic logic to pick a random active participant
    const activeEntries = await Lottery.find({ status: 'ACTIVE' });

    if (activeEntries.length === 0) {
      return res.status(400).json({ message: 'No active participants' });
    }

    const randomIndex = Math.floor(Math.random() * activeEntries.length);
    const winner = activeEntries[randomIndex];

    winner.status = 'WON';
    await winner.save();

    res.status(200).json({ message: `Winner selected! Ticket: ${winner.ticketNumber}`, winner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  participateLottery,
  getLotteryEntries,
  pickWinner
};
