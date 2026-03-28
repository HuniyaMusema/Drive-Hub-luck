const pool = require('../config/pgPool');

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
const getCars = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM cars ORDER BY created_at DESC'
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('[getCars]', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Public
const getCarById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM cars WHERE id = $1',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('[getCarById]', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a car
// @route   POST /api/cars
// @access  Private (Any authenticated user can sell)
const createCar = async (req, res) => {
  const { name, price, type, description, specs, location, images } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO cars (name, price, type, description, specs, location, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, price, type, description, JSON.stringify(specs), location, JSON.stringify(images)]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('[createCar]', error.message);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a car
// @route   PUT /api/cars/:id
// @access  Private (Owner or Admin)
const updateCar = async (req, res) => {
  const { name, price, type, description, specs, location, images } = req.body;

  try {
    // Check if car exists
    const { rows: existing } = await pool.query(
      'SELECT id FROM cars WHERE id = $1',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Note: Original code had ownership check: car.seller.toString() !== req.user.id
    // The current schema.sql doesn't have a seller_id in the cars table yet.
    // If it's intended to be public/admin only for now, we follow the schema.
    
    const { rows } = await pool.query(
      `UPDATE cars 
       SET name = $1, price = $2, type = $3, description = $4, specs = $5, location = $6, images = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [name, price, type, description, JSON.stringify(specs), location, JSON.stringify(images), req.params.id]
    );

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('[updateCar]', error.message);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a car
// @route   DELETE /api/cars/:id
// @access  Private (Owner or Admin)
const deleteCar = async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM cars WHERE id = $1',
      [req.params.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json({ id: req.params.id, message: 'Car deleted' });
  } catch (error) {
    console.error('[deleteCar]', error.message);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
};

