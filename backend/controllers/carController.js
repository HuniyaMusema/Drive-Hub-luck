const pool = require('../config/pgPool');
const SettingsManager = require('../services/SettingsManager');

// @desc    Get all cars
// @route   GET /api/cars
// @access  Public
const getCars = async (req, res) => {
  try {
    let types = ['sale', 'rental'];

    const { rows } = await pool.query(
      `SELECT c.*, u.name AS seller_name, u.email AS seller_email 
       FROM cars c 
       JOIN users u ON c.seller_id = u.id 
       WHERE c.type = ANY($1::car_type[])
       ORDER BY c.created_at DESC`,
      [types]
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
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT c.*, u.name AS seller_name, u.email AS seller_email 
       FROM cars c 
       JOIN users u ON c.seller_id = u.id 
       WHERE c.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const car = rows[0];

    res.status(200).json(car);
  } catch (error) {
    console.error('[getCarById]', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a car
// @route   POST /api/cars
// @access  Private (Any authenticated user can sell)
const createCar = async (req, res) => {
  const { 
    make, model, year, price, type, status, description, image, 
    contactPhone, location, mileage, fuel, transmission, seats 
  } = req.body;

  if (!make || !model || !price || !type) {
    return res.status(400).json({ message: 'Please provide all required fields (make, model, price, type)' });
  }

  try {
    const name = `${make} ${model}`;
    const sql_type = type.toLowerCase() === 'rent' ? 'rental' : 'sale';
    const sql_status = status ? status.toLowerCase() : 'available';
    const specs = JSON.stringify({ 
      year: Number(year), 
      mileage: mileage || '0 mi', 
      fuel: fuel || 'Gasoline', 
      transmission: transmission || 'Automatic', 
      seats: Number(seats) || 5 
    });
    const images = JSON.stringify(image ? [image] : []);

    const { rows } = await pool.query(
      `INSERT INTO cars (seller_id, name, price, type, status, description, specs, location, contact_phone, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.user.id, name, price, sql_type, sql_status, description, specs, location, contactPhone, images]
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
  const { id } = req.params;
  const { 
    make, model, year, price, type, status, description, image, 
    contactPhone, location, mileage, fuel, transmission, seats 
  } = req.body;

  try {
    const { rows: existing } = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const car = existing[0];

    // Make sure user is car owner or admin
    if (car.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this car' });
    }

    // Dynamic update logic
    // Only combine make and model if both are provided; otherwise use previous name if those are empty
    let name = car.name;
    if (make && model) {
      name = `${make} ${model}`;
    } else if (make || model) {
      // If only one is provided, we try to preserve the other part from the old name if possible
      const parts = car.name.split(' ');
      const oldMake = parts[0];
      const oldModel = parts.slice(1).join(' ');
      name = `${make || oldMake} ${model || oldModel}`;
    }

    const sql_type = type ? (type.toLowerCase() === 'rent' ? 'rental' : 'sale') : car.type;
    const sql_status = status ? status.toLowerCase() : car.status;
    
    // Ensure specs stays as an object for JSONB
    const currentSpecs = typeof car.specs === 'string' ? JSON.parse(car.specs) : (car.specs || {});
    const specs = { 
      ...currentSpecs, 
      year: year ? Number(year) : currentSpecs.year,
      mileage: mileage !== undefined ? mileage : currentSpecs.mileage,
      fuel: fuel !== undefined ? fuel : currentSpecs.fuel,
      transmission: transmission !== undefined ? transmission : currentSpecs.transmission,
      seats: seats !== undefined ? Number(seats) : currentSpecs.seats
    };
    
    // Ensure images stays as an array/object for JSONB
    const currentImages = typeof car.images === 'string' ? JSON.parse(car.images) : (car.images || []);
    const images = image ? [image] : currentImages;

    const { rows: updated } = await pool.query(
      `UPDATE cars 
       SET name = $1, price = $2, type = $3, status = $4, description = $5, specs = $6, location = $7, contact_phone = $8, images = $9, updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        name, 
        price !== undefined ? Number(price) : car.price, 
        sql_type, 
        sql_status, 
        description !== undefined ? description : car.description, 
        JSON.stringify(specs), 
        location !== undefined ? location : car.location, 
        contactPhone !== undefined ? contactPhone : car.contact_phone, 
        JSON.stringify(images), 

        id
      ]
    );

    if (updated.length === 0) {
      throw new Error("Failed to update car - row not found during update execution");
    }

    console.log(`[updateCar] Successfully updated car ${id}`);
    res.status(200).json(updated[0]);
  } catch (error) {
    console.error('[updateCar] Error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a car
// @route   DELETE /api/cars/:id
// @access  Private (Owner or Admin)
const deleteCar = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: existing } = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const car = existing[0];

    // Make sure user is car owner or admin
    if (car.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this car' });
    }

    await pool.query('DELETE FROM cars WHERE id = $1', [id]);

    res.status(200).json({ id, message: 'Car deleted' });
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

