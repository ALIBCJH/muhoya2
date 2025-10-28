const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { AppError } = require('../middleware/errorHandler');
const { successResponse, getPagination, buildPaginationResponse } = require('../utils/helpers');

/**
 * @desc    Get all organizations
 * @route   GET /api/organizations
 * @access  Private
 */
const getOrganizations = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req);
  const { search } = req.query;

  let query = `
    SELECT o.*, 
           COUNT(v.id) as vehicle_count
    FROM organizations o
    LEFT JOIN vehicles v ON o.id = v.organization_id
  `;
  let countQuery = 'SELECT COUNT(*) FROM organizations o';
  const queryParams = [];
  let paramIndex = 1;

  if (search) {
    const searchClause = ` WHERE o.name ILIKE $${paramIndex} OR o.contact_person ILIKE $${paramIndex}`;
    query += searchClause;
    countQuery += searchClause;
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  query += ' GROUP BY o.id';
  query += ' ORDER BY o.name ASC';
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
 * @desc    Get single organization
 * @route   GET /api/organizations/:id
 * @access  Private
 */
const getOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    'SELECT * FROM organizations WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Organization not found', 404);
  }

  successResponse(res, 200, 'Organization retrieved successfully', {
    organization: result.rows[0]
  });
});

/**
 * @desc    Create new organization
 * @route   POST /api/organizations
 * @access  Private (Admin, Receptionist)
 */
const createOrganization = asyncHandler(async (req, res) => {
  const { name, contact_person, email, phone, address } = req.body;

  const result = await db.query(
    `INSERT INTO organizations (name, contact_person, email, phone, address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, contact_person, email, phone, address]
  );

  successResponse(res, 201, 'Organization created successfully', {
    organization: result.rows[0]
  });
});

/**
 * @desc    Update organization
 * @route   PUT /api/organizations/:id
 * @access  Private (Admin, Receptionist)
 */
const updateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Check if organization exists
  const existing = await db.query('SELECT id FROM organizations WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new AppError('Organization not found', 404);
  }

  // Build dynamic update query
  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  Object.keys(updates).forEach(key => {
    if (['name', 'contact_person', 'email', 'phone', 'address'].includes(key)) {
      updateFields.push(`${key} = $${paramIndex}`);
      values.push(updates[key]);
      paramIndex++;
    }
  });

  if (updateFields.length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  values.push(id);
  const query = `UPDATE organizations SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

  const result = await db.query(query, values);

  successResponse(res, 200, 'Organization updated successfully', {
    organization: result.rows[0]
  });
});

/**
 * @desc    Delete organization
 * @route   DELETE /api/organizations/:id
 * @access  Private (Admin)
 */
const deleteOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if organization has vehicles
  const vehiclesCheck = await db.query(
    'SELECT COUNT(*) FROM vehicles WHERE organization_id = $1',
    [id]
  );

  if (parseInt(vehiclesCheck.rows[0].count) > 0) {
    throw new AppError('Cannot delete organization with existing vehicles. Please reassign or delete vehicles first.', 400);
  }

  const result = await db.query('DELETE FROM organizations WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Organization not found', 404);
  }

  successResponse(res, 200, 'Organization deleted successfully');
});

/**
 * @desc    Get organization vehicles
 * @route   GET /api/organizations/:id/vehicles
 * @access  Private
 */
const getOrganizationVehicles = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page, limit, offset } = getPagination(req);

  // Check if organization exists
  const orgCheck = await db.query('SELECT id FROM organizations WHERE id = $1', [id]);
  if (orgCheck.rows.length === 0) {
    throw new AppError('Organization not found', 404);
  }

  const query = `
    SELECT * FROM vehicles 
    WHERE organization_id = $1 
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = 'SELECT COUNT(*) FROM vehicles WHERE organization_id = $1';

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
 * @desc    Create organization with vehicles (for fleet form)
 * @route   POST /api/organizations/with-vehicles
 * @access  Private (Admin, Receptionist)
 */
const createOrganizationWithVehicles = asyncHandler(async (req, res) => {
  const { name, contact_person, email, phone, address, vehicles } = req.body;

  // Validate organization data
  if (!name || !name.trim()) {
    throw new AppError('Organization name is required', 400);
  }

  if (!contact_person || !contact_person.trim()) {
    throw new AppError('Contact person is required', 400);
  }

  if (!vehicles || vehicles.length === 0) {
    throw new AppError('At least one vehicle is required', 400);
  }

  // Start transaction
  const result = await db.transaction(async (transactionClient) => {
    // Create organization
    const orgResult = await transactionClient.query(
      `INSERT INTO organizations (name, contact_person, email, phone, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, contact_person, email || null, phone, address || null]
    );

    const organization = orgResult.rows[0];

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
        `INSERT INTO vehicles (registration_number, make_model, vehicle_type, year, organization_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [regNo, makeModel, vehicleType, new Date().getFullYear(), organization.id]
      );

      createdVehicles.push(vehicleResult.rows[0]);
    }

    return { organization, vehicles: createdVehicles };
  });

  successResponse(res, 201, 'Organization and vehicles created successfully', result);
});

module.exports = {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationVehicles,
  createOrganizationWithVehicles,
};
