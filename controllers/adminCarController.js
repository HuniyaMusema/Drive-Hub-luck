const pool = require('../config/pgPool');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Add a new car
// @route   POST /api/admin/cars
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
const addCar = async (req, res) => {
  try {
    const { name, price, description, specs, images, type, location } = req.body;

    // Validation
    if (!name || price === undefined || !type) {
      return res.status(400).json({ message: 'Name, price, and type are required' });
    }

    if (!['sale', 'rental'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either sale or rental' });
    }

    const { rows } = await pool.query(
      `INSERT INTO cars (name, price, description, specs, images, type, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name,
        price,
        description || null,
        specs ? JSON.stringify(specs) : null,
        images ? JSON.stringify(images) : null,
        type,
        location || null
      ]
    );

    res.status(201).json({
      message: 'Car added successfully',
      car: rows[0],
    });
  } catch (error) {
    console.error('[addCar]', error.message);
    res.status(500).json({ message: 'Server error adding car' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all cars (Admin view)
// @route   GET /api/admin/cars
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAllCars = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM cars ORDER BY created_at DESC'
    );
    res.status(200).json({ cars: rows });
  } catch (error) {
    console.error('[getAllCars]', error.message);
    res.status(500).json({ message: 'Server error fetching cars' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single car by ID
// @route   GET /api/admin/cars/:id
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
const getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM cars WHERE id = $1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json({ car: rows[0] });
  } catch (error) {
    console.error('[getCarById]', error.message);
    res.status(500).json({ message: 'Server error fetching car' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update car
// @route   PUT /api/admin/cars/:id
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, specs, images, type, location } = req.body;

    const { rows: existingCar } = await pool.query(
      'SELECT * FROM cars WHERE id = $1',
      [id]
    );

    if (existingCar.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    let updateQuery = 'UPDATE cars SET ';
    const updateValues = [];
    let paramIndex = 1;

    if (name) { updateQuery += `name = $${paramIndex++}, `; updateValues.push(name); }
    if (price !== undefined) { updateQuery += `price = $${paramIndex++}, `; updateValues.push(price); }
    if (description !== undefined) { updateQuery += `description = $${paramIndex++}, `; updateValues.push(description); }
    if (specs) { updateQuery += `specs = $${paramIndex++}, `; updateValues.push(JSON.stringify(specs)); }
    if (images) { updateQuery += `images = $${paramIndex++}, `; updateValues.push(JSON.stringify(images)); }
    if (type) {
      if (!['sale', 'rental'].includes(type)) {
        return res.status(400).json({ message: 'Type must be either sale or rental' });
      }
      updateQuery += `type = $${paramIndex++}, `; updateValues.push(type);
    }
    if (location !== undefined) { updateQuery += `location = $${paramIndex++}, `; updateValues.push(location); }

    // If no fields to update
    if (updateValues.length === 0) {
      return res.status(400).json({ message: 'No fields provided to update' });
    }

    // Remove trailing comma and space
    updateQuery = updateQuery.slice(0, -2);
    
    updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
    updateValues.push(id);

    const { rows } = await pool.query(updateQuery, updateValues);

    res.status(200).json({
      message: 'Car updated successfully',
      car: rows[0],
    });
  } catch (error) {
    console.error('[updateCar]', error.message);
    res.status(500).json({ message: 'Server error updating car' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete car
// @route   DELETE /api/admin/cars/:id
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      'DELETE FROM cars WHERE id = $1 RETURNING id',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.status(200).json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('[deleteCar]', error.message);
    res.status(500).json({ message: 'Server error deleting car' });
  }
};

module.exports = {
  addCar,
  getAllCars,
  getCarById,
  updateCar,
  deleteCar,
};
