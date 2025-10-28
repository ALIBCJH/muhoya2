const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { AppError } = require('../middleware/errorHandler');
const { successResponse, getPagination, buildPaginationResponse } = require('../utils/helpers');

/**
 * @desc    Get all vehicles
 * @route   GET /api/vehicles
 * @access  Private
 */
const getVehicles = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req);
  const { search, organization_id, client_id } = req.query;

  let query = `
    SELECT v.*, 
           o.name as organization_name, 
           c.name as client_name
    FROM vehicles v
    LEFT JOIN organizations o ON v.organization_id = o.id
    LEFT JOIN clients c ON v.client_id = c.id
  `;

  let countQuery = `
    SELECT COUNT(*) 
    FROM vehicles v
    LEFT JOIN organizations o ON v.organization_id = o.id
    LEFT JOIN clients c ON v.client_id = c.id
  `;
  
  const queryParams = [];
  const conditions = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`(v.registration_number ILIKE $${paramIndex} OR v.make_model ILIKE $${paramIndex} OR v.vin ILIKE $${paramIndex})`);
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (organization_id) {
    conditions.push(`v.organization_id = $${paramIndex}`);
    queryParams.push(organization_id);
    paramIndex++;
  }

  if (client_id) {
    conditions.push(`v.client_id = $${paramIndex}`);
    queryParams.push(client_id);
    paramIndex++;
  }

  if (conditions.length > 0) {
    const whereClause = ` WHERE ${conditions.join(' AND ')}`;
    query += whereClause;
    countQuery += whereClause;
  }

  query += ' ORDER BY v.created_at DESC';
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(limit, offset);

  const countParams = queryParams.slice(0, -2); // Remove limit and offset
  
  const [dataResult, countResult] = await Promise.all([
    db.query(query, queryParams),
    db.query(countQuery, countParams.length > 0 ? countParams : [])
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
 * @desc    Get single vehicle
 * @route   GET /api/vehicles/:id
 * @access  Private
 */
const getVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `SELECT v.*, 
            o.name as organization_name, 
            c.name as client_name
     FROM vehicles v
     LEFT JOIN organizations o ON v.organization_id = o.id
     LEFT JOIN clients c ON v.client_id = c.id
     WHERE v.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Vehicle not found', 404);
  }

  successResponse(res, 200, 'Vehicle retrieved successfully', {
    vehicle: result.rows[0]
  });
});

/**
 * @desc    Create new vehicle
 * @route   POST /api/vehicles
 * @access  Private (Admin, Receptionist)
 */
const createVehicle = asyncHandler(async (req, res) => {
  const { registration_number, make_model, vehicle_type, year, color, vin, organization_id, client_id } = req.body;

  // Check if vehicle with same registration number exists
  const existing = await db.query(
    'SELECT id FROM vehicles WHERE registration_number = $1',
    [registration_number]
  );

  if (existing.rows.length > 0) {
    throw new AppError('Vehicle with this registration number already exists', 409);
  }

  // Verify organization or client exists
  if (organization_id) {
    const orgCheck = await db.query('SELECT id FROM organizations WHERE id = $1', [organization_id]);
    if (orgCheck.rows.length === 0) {
      throw new AppError('Organization not found', 404);
    }
  }

  if (client_id) {
    const clientCheck = await db.query('SELECT id FROM clients WHERE id = $1', [client_id]);
    if (clientCheck.rows.length === 0) {
      throw new AppError('Client not found', 404);
    }
  }

  const result = await db.query(
    `INSERT INTO vehicles (registration_number, make_model, vehicle_type, year, color, vin, organization_id, client_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [registration_number, make_model, vehicle_type, year, color, vin, organization_id, client_id]
  );

  successResponse(res, 201, 'Vehicle created successfully', {
    vehicle: result.rows[0]
  });
});

/**
 * @desc    Update vehicle
 * @route   PUT /api/vehicles/:id
 * @access  Private (Admin, Receptionist)
 */
const updateVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Check if vehicle exists
  const existing = await db.query('SELECT id FROM vehicles WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new AppError('Vehicle not found', 404);
  }

  // If updating registration number, check for duplicates
  if (updates.registration_number) {
    const plateCheck = await db.query(
      'SELECT id FROM vehicles WHERE registration_number = $1 AND id != $2',
      [updates.registration_number, id]
    );
    if (plateCheck.rows.length > 0) {
      throw new AppError('Another vehicle with this registration number already exists', 409);
    }
  }

  // Build dynamic update query
  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  const allowedFields = ['registration_number', 'make_model', 'vehicle_type', 'year', 'color', 'vin'];
  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = $${paramIndex}`);
      values.push(updates[key]);
      paramIndex++;
    }
  });

  if (updateFields.length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  values.push(id);
  const query = `UPDATE vehicles SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

  const result = await db.query(query, values);

  successResponse(res, 200, 'Vehicle updated successfully', {
    vehicle: result.rows[0]
  });
});

/**
 * @desc    Delete vehicle
 * @route   DELETE /api/vehicles/:id
 * @access  Private (Admin)
 */
const deleteVehicle = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if vehicle has service records
  const servicesCheck = await db.query(
    'SELECT COUNT(*) FROM service_records WHERE vehicle_id = $1',
    [id]
  );

  if (parseInt(servicesCheck.rows[0].count) > 0) {
    throw new AppError('Cannot delete vehicle with existing service records', 400);
  }

  const result = await db.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Vehicle not found', 404);
  }

  successResponse(res, 200, 'Vehicle deleted successfully');
});

/**
 * @desc    Get vehicle service history
 * @route   GET /api/vehicles/:id/services
 * @access  Private
 */
const getVehicleServices = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page, limit, offset } = getPagination(req);

  // Check if vehicle exists
  const vehicleCheck = await db.query('SELECT id FROM vehicles WHERE id = $1', [id]);
  if (vehicleCheck.rows.length === 0) {
    throw new AppError('Vehicle not found', 404);
  }

  const query = `
    SELECT sr.*, u.full_name as mechanic_name
    FROM service_records sr
    LEFT JOIN users u ON sr.mechanic_id = u.id
    WHERE sr.vehicle_id = $1
    ORDER BY sr.service_date DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = 'SELECT COUNT(*) FROM service_records WHERE vehicle_id = $1';

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

module.exports = {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleServices,
};
