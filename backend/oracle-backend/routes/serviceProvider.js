const express = require('express');
const router = express.Router();
const connect = require('../db');
const auth = require('../middleware/auth');
const oracledb = require('oracledb');


// GET all services
router.get('/', async (req, res) => {
  try {
    const conn = await connect();
    const result = await conn.execute(`
      SELECT s.service_id, s.title, s.description, s.price, s.duration_minutes, 
             s.is_available, s.provider_id, s.category_id, s.created_at,
             u.name as provider_name, c.name as category_name
      FROM services s
      JOIN users u ON s.provider_id = u.user_id
      JOIN categories c ON s.category_id = c.category_id
      WHERE s.is_available = 1
      ORDER BY s.created_at DESC
    `);
    
    // Format the results
    const services = result.rows.map(row => ({
      service_id: row[0],
      title: row[1],
      description: row[2],
      price: row[3],
      duration_minutes: row[4],
      is_available: row[5] === 1,
      provider_id: row[6],
      category_id: row[7],
      created_at: row[8],
      provider_name: row[9],
      category_name: row[10]
    }));
    
    res.json(services);
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET service by ID
router.get('/:id', async (req, res) => {
  try {
    const conn = await connect();
    const result = await conn.execute(`
      SELECT s.service_id, s.title, s.description, s.price, s.duration_minutes, 
             s.is_available, s.provider_id, s.category_id, s.created_at,
             u.name as provider_name, c.name as category_name
      FROM services s
      JOIN users u ON s.provider_id = u.user_id
      JOIN categories c ON s.category_id = c.category_id
      WHERE s.service_id = :1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      await conn.close();
      return res.status(404).json({ message: 'Service not found' });
    }
    
    const row = result.rows[0];
    const service = {
      service_id: row[0],
      title: row[1],
      description: row[2],
      price: row[3],
      duration_minutes: row[4],
      is_available: row[5] === 1,
      provider_id: row[6],
      category_id: row[7],
      created_at: row[8],
      provider_name: row[9],
      category_name: row[10]
    };
    
    res.json(service);
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST new service
router.post('/', auth, async (req, res) => {
  // Check if user is a provider
  if (req.user.role !== 'provider') {
    return res.status(403).json({ message: 'Only service providers can add services' });
  }
  
  const { title, description, price, duration_minutes, category_id } = req.body;
  
  try {
    const conn = await connect();
    
    // Insert service
    const result = await conn.execute(
      `INSERT INTO services (title, description, price, duration_minutes, is_available, provider_id, category_id) 
       VALUES (:1, :2, :3, :4, :5, :6, :7)
       RETURNING service_id INTO :8`,
      [title, description, price, duration_minutes, 1, req.user.id, category_id, 
       { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }],
      { autoCommit: true }
    );
    
    const serviceId = result.outBinds[0][0];
    
    res.status(201).json({ 
      message: 'Service created successfully',
      service_id: serviceId
    });
    
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT update service
router.put('/:id', auth, async (req, res) => {
  try {
    const conn = await connect();
    
    // Check if service exists and belongs to the provider
    const serviceCheck = await conn.execute(
      `SELECT provider_id FROM services WHERE service_id = :1`,
      [req.params.id]
    );
    
    if (serviceCheck.rows.length === 0) {
      await conn.close();
      return res.status(404).json({ message: 'Service not found' });
    }
    
    const providerId = serviceCheck.rows[0][0];
    
    // Check if user is the service provider
    if (req.user.id !== providerId && req.user.role !== 'admin') {
      await conn.close();
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }
    
    const { title, description, price, duration_minutes, is_available, category_id } = req.body;
    
    // Update service
    await conn.execute(
      `UPDATE services 
       SET title = :1, description = :2, price = :3, duration_minutes = :4, 
           is_available = :5, category_id = :6
       WHERE service_id = :7`,
      [title, description, price, duration_minutes, is_available ? 1 : 0, category_id, req.params.id],
      { autoCommit: true }
    );
    
    res.json({ message: 'Service updated successfully' });
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE service
router.delete('/:id', auth, async (req, res) => {
  try {
    const conn = await connect();
    
    // Check if service exists and belongs to the provider
    const serviceCheck = await conn.execute(
      `SELECT provider_id FROM services WHERE service_id = :1`,
      [req.params.id]
    );
    
    if (serviceCheck.rows.length === 0) {
      await conn.close();
      return res.status(404).json({ message: 'Service not found' });
    }
    
    const providerId = serviceCheck.rows[0][0];
    
    // Check if user is the service provider
    if (req.user.id !== providerId && req.user.role !== 'admin') {
      await conn.close();
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }
    
    // Delete service
    await conn.execute(
      `DELETE FROM services WHERE service_id = :1`,
      [req.params.id],
      { autoCommit: true }
    );
    
    res.json({ message: 'Service deleted successfully' });
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET services by provider
router.get('/provider/me', auth, async (req, res) => {
  // Check if user is a provider
  if (req.user.role !== 'provider') {
    return res.status(403).json({ message: 'Only service providers can access this endpoint' });
  }
  
  try {
    const conn = await connect();
    const result = await conn.execute(`
      SELECT s.service_id, s.title, s.description, s.price, s.duration_minutes, 
             s.is_available, s.provider_id, s.category_id, s.created_at,
             c.name as category_name
      FROM services s
      JOIN categories c ON s.category_id = c.category_id
      WHERE s.provider_id = :1
      ORDER BY s.created_at DESC
    `, [req.user.id]);
    
    // Format the results
    const services = result.rows.map(row => ({
      service_id: row[0],
      title: row[1],
      description: row[2],
      price: row[3],
      duration_minutes: row[4],
      is_available: row[5] === 1,
      provider_id: row[6],
      category_id: row[7],
      created_at: row[8],
      category_name: row[9]
    }));
    
    res.json(services);
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});
// PATCH only service availability
router.patch('/:id/availability', auth, async (req, res) => {
  try {
    const { is_available } = req.body;
    
    if (typeof is_available !== 'boolean') {
      return res.status(400).json({ message: 'is_available must be boolean' });
    }

    const conn = await connect();

    // Check if service exists and belongs to the provider
    const serviceCheck = await conn.execute(
      `SELECT provider_id FROM services WHERE service_id = :1`,
      [req.params.id]
    );

    if (serviceCheck.rows.length === 0) {
      await conn.close();
      return res.status(404).json({ message: 'Service not found' });
    }

    const providerId = serviceCheck.rows[0][0];

    if (req.user.id !== providerId && req.user.role !== 'admin') {
      await conn.close();
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    await conn.execute(
      `UPDATE services SET is_available = :1 WHERE service_id = :2`,
      [is_available ? 1 : 0, req.params.id],
      { autoCommit: true }
    );

    res.json({ message: `Service marked as ${is_available ? 'available' : 'unavailable'}` });
    await conn.close();
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;