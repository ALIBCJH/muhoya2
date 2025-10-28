const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { AppError } = require('../middleware/errorHandler');
const { successResponse, getPagination, buildPaginationResponse } = require('../utils/helpers');

/**
 * @desc    Get all clients
 * @route   GET /api/clients
 * @access  Private
 */
const getClients = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req);
  const { search } = req.query;

  let query = `
    SELECT c.*, 
           COUNT(v.id) as vehicle_count
    FROM clients c
    LEFT JOIN vehicles v ON c.id = v.client_id
  `;
  let countQuery = 'SELECT COUNT(*) FROM clients c';
  const queryParams = [];
  let paramIndex = 1;

  if (search) {
    const searchClause = ` WHERE c.name ILIKE $${paramIndex} OR c.phone ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex}`;
    query += searchClause;
    countQuery += searchClause;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  query += ' GROUP BY c.id';
  query += ' ORDER BY c.name ASC';
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(limit, offset);

  const [dataResult, countResult] = await Promise.all([
    db.query(query, queryParams),
    db.query(countQuery, search ? [`%${search}%`] : [])
  ]);

  const response = buildPaginationResponse(
    dataResult.rows,
    page,
    limit,
    parseInt(countResult.rows[0].count)
  );

  res.status(200).json(response);
});

/**
 * @desc    Get single client
 * @route   GET /api/clients/:id
 * @access  Private
 */
const getClient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    'SELECT * FROM clients WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Client not found', 404);
  }

  successResponse(res, 200, 'Client retrieved successfully', {
    client: result.rows[0]
  });
});

/**
 * @desc    Create new client
 * @route   POST /api/clients
 * @access  Private (Admin, Receptionist)
 */
const createClient = asyncHandler(async (req, res) => {
  const { name, email, phone, address } = req.body;

  // Check if client with same phone exists
  const existing = await db.query('SELECT id FROM clients WHERE phone = $1', [phone]);
  if (existing.rows.length > 0) {
    throw new AppError('Client with this phone number already exists', 409);
  }

  const result = await db.query(
    `INSERT INTO clients (name, email, phone, address)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, phone, address]
  );

  successResponse(res, 201, 'Client created successfully', {
    client: result.rows[0]
  });
});

/**
 * @desc    Update client
 * @route   PUT /api/clients/:id
 * @access  Private (Admin, Receptionist)
 */
const updateClient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Check if client exists
  const existing = await db.query('SELECT id FROM clients WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new AppError('Client not found', 404);
  }

  // If updating phone, check for duplicates
  if (updates.phone) {
    const phoneCheck = await db.query(
      'SELECT id FROM clients WHERE phone = $1 AND id != $2',
      [updates.phone, id]
    );
    if (phoneCheck.rows.length > 0) {
      throw new AppError('Another client with this phone number already exists', 409);
    }
  }

  // Build dynamic update query
  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  Object.keys(updates).forEach(key => {
    if (['name', 'email', 'phone', 'address'].includes(key)) {
      updateFields.push(`${key} = $${paramIndex}`);
      values.push(updates[key]);
      paramIndex++;
    }
  });

  if (updateFields.length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  values.push(id);
  const query = `UPDATE clients SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

  const result = await db.query(query, values);

  successResponse(res, 200, 'Client updated successfully', {
    client: result.rows[0]
  });
});

/**
 * @desc    Delete client
 * @route   DELETE /api/clients/:id
 * @access  Private (Admin)
 */
const deleteClient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if client has vehicles
  const vehiclesCheck = await db.query(
    'SELECT COUNT(*) FROM vehicles WHERE client_id = $1',
    [id]
  );

  if (parseInt(vehiclesCheck.rows[0].count) > 0) {
    throw new AppError('Cannot delete client with existing vehicles. Please reassign or delete vehicles first.', 400);
  }

  const result = await db.query('DELETE FROM clients WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Client not found', 404);
  }

  successResponse(res, 200, 'Client deleted successfully');
});

/**
 * @desc    Get client vehicles
 * @route   GET /api/clients/:id/vehicles
 * @access  Private
 */
const getClientVehicles = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page, limit, offset } = getPagination(req);

  // Check if client exists
  const clientCheck = await db.query('SELECT id FROM clients WHERE id = $1', [id]);
  if (clientCheck.rows.length === 0) {
    throw new AppError('Client not found', 404);
  }

  const query = `
    SELECT * FROM vehicles 
    WHERE client_id = $1 
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = 'SELECT COUNT(*) FROM vehicles WHERE client_id = $1';

  const [dataResult, countResult] = await Promise.all([
    db.query(query, [id, limit, offset]),
    db.query(countQuery, [id])
  ]);

  const response = buildPaginationResponse(
    dataResult.rows,
    page,
    limit,
    parseInt(countResult.rows[0].count)
  );

  res.status(200).json(response);
});

/**
 * @desc    Get client service history
 * @route   GET /api/clients/:id/services
 * @access  Private
 */
const getClientServices = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page, limit, offset } = getPagination(req);

  // Check if client exists
  const clientCheck = await db.query('SELECT id FROM clients WHERE id = $1', [id]);
  if (clientCheck.rows.length === 0) {
    throw new AppError('Client not found', 404);
  }

  const query = `
    SELECT sr.*, v.registration_number, v.make_model
    FROM service_records sr
    JOIN vehicles v ON sr.vehicle_id = v.id
    WHERE v.client_id = $1
    ORDER BY sr.service_date DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*)
    FROM service_records sr
    JOIN vehicles v ON sr.vehicle_id = v.id
    WHERE v.client_id = $1
  `;

  const [dataResult, countResult] = await Promise.all([
    db.query(query, [id, limit, offset]),
    db.query(countQuery, [id])
  ]);

  const response = buildPaginationResponse(
    dataResult.rows,
    page,
    limit,
    parseInt(countResult.rows[0].count)
  );

  res.status(200).json(response);
});

/**
 * @desc    Create client with vehicles (for walk-in form)
 * @route   POST /api/clients/with-vehicles
 * @access  Private (Admin, Receptionist)
 */
const createClientWithVehicles = asyncHandler(async (req, res) => {
  const { clientName, phone, email, vehicles } = req.body;

  // Validate client data
  if (!clientName || !clientName.trim()) {
    throw new AppError('Client name is required', 400);
  }

  if (!vehicles || vehicles.length === 0) {
    throw new AppError('At least one vehicle is required', 400);
  }

  // Check if client with same phone exists
  const existingClient = await db.query(
    'SELECT id FROM clients WHERE phone = $1',
    [phone]
  );

  if (existingClient.rows.length > 0) {
    throw new AppError('Client with this phone number already exists', 409);
  }

  // Start transaction
  const result = await db.transaction(async (transactionClient) => {
    // Create client
    const clientResult = await transactionClient.query(
      `INSERT INTO clients (name, email, phone, address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [clientName, email || null, phone, null]
    );

    const client = clientResult.rows[0];

    // Create vehicles
    const createdVehicles = [];
    for (const vehicle of vehicles) {
      const { vehicleType, makeModel, regNo } = vehicle;

      // Check for duplicate registration number
      const duplicateCheck = await transactionClient.query(
        'SELECT id FROM vehicles WHERE registration_number = $1',
        [regNo]
      );

      if (duplicateCheck.rows.length > 0) {
        throw new AppError(`Vehicle with registration ${regNo} already exists`, 409);
      }

      // Create vehicle
      const vehicleResult = await transactionClient.query(
        `INSERT INTO vehicles (registration_number, make_model, vehicle_type, year, client_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [regNo, makeModel, vehicleType, new Date().getFullYear(), client.id]
      );

      createdVehicles.push(vehicleResult.rows[0]);
    }

    return { client, vehicles: createdVehicles };
  });

  successResponse(res, 201, 'Client and vehicles created successfully', result);
});

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientVehicles,
  getClientServices,
  createClientWithVehicles,
};
