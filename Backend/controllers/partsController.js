const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { AppError } = require('../middleware/errorHandler');
const { successResponse, getPagination, buildPaginationResponse } = require('../utils/helpers');

/**
 * @desc    Get all parts
 * @route   GET /api/parts
 * @access  Private
 */
const getParts = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req);
  const { search, low_stock } = req.query;

  let query = 'SELECT * FROM parts';
  let countQuery = 'SELECT COUNT(*) FROM parts';
  const queryParams = [];
  const conditions = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`(part_name ILIKE $${paramIndex} OR part_number ILIKE $${paramIndex})`);
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (low_stock === 'true') {
    conditions.push(`quantity_in_stock <= reorder_level`);
  }

  if (conditions.length > 0) {
    const whereClause = ` WHERE ${conditions.join(' AND ')}`;
    query += whereClause;
    countQuery += whereClause;
  }

  query += ' ORDER BY part_name ASC';
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(limit, offset);

  const countParams = queryParams.slice(0, -2);
  
  const [dataResult, countResult] = await Promise.all([
    db.query(query, queryParams),
    db.query(countQuery, countParams)
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
 * @desc    Get single part
 * @route   GET /api/parts/:id
 * @access  Private
 */
const getPart = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    'SELECT * FROM parts WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Part not found', 404);
  }

  successResponse(res, 200, 'Part retrieved successfully', {
    part: result.rows[0]
  });
});

/**
 * @desc    Create new part
 * @route   POST /api/parts
 * @access  Private (Admin, Mechanic)
 */
const createPart = asyncHandler(async (req, res) => {
  const { part_name, part_number, price, quantity_in_stock = 0, reorder_level = 5 } = req.body;

  // Check if part with same part number exists
  if (part_number) {
    const existing = await db.query(
      'SELECT id FROM parts WHERE part_number = $1',
      [part_number]
    );

    if (existing.rows.length > 0) {
      throw new AppError('Part with this part number already exists', 409);
    }
  }

  const result = await db.query(
    `INSERT INTO parts (part_name, part_number, price, quantity_in_stock, reorder_level)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [part_name, part_number, price, quantity_in_stock, reorder_level]
  );

  successResponse(res, 201, 'Part created successfully', {
    part: result.rows[0]
  });
});

/**
 * @desc    Update part
 * @route   PUT /api/parts/:id
 * @access  Private (Admin, Mechanic)
 */
const updatePart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Check if part exists
  const existing = await db.query('SELECT id FROM parts WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new AppError('Part not found', 404);
  }

  // If updating part number, check for duplicates
  if (updates.part_number) {
    const partNumberCheck = await db.query(
      'SELECT id FROM parts WHERE part_number = $1 AND id != $2',
      [updates.part_number, id]
    );
    if (partNumberCheck.rows.length > 0) {
      throw new AppError('Another part with this part number already exists', 409);
    }
  }

  // Build dynamic update query
  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  const allowedFields = ['part_name', 'part_number', 'price', 'quantity_in_stock', 'reorder_level'];
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
  const query = `UPDATE parts SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

  const result = await db.query(query, values);

  successResponse(res, 200, 'Part updated successfully', {
    part: result.rows[0]
  });
});

/**
 * @desc    Delete part
 * @route   DELETE /api/parts/:id
 * @access  Private (Admin)
 */
const deletePart = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if part is used in service records
  const servicesCheck = await db.query(
    'SELECT COUNT(*) FROM service_parts WHERE part_id = $1',
    [id]
  );

  if (parseInt(servicesCheck.rows[0].count) > 0) {
    throw new AppError('Cannot delete part that has been used in service records', 400);
  }

  const result = await db.query('DELETE FROM parts WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    throw new AppError('Part not found', 404);
  }

  successResponse(res, 200, 'Part deleted successfully');
});

/**
 * @desc    Get low stock parts
 * @route   GET /api/parts/alerts/low-stock
 * @access  Private
 */
const getLowStockParts = asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT * FROM low_stock_parts ORDER BY quantity_in_stock ASC`
  );

  successResponse(res, 200, 'Low stock parts retrieved successfully', {
    parts: result.rows,
    count: result.rows.length
  });
});

/**
 * @desc    Update part stock
 * @route   PATCH /api/parts/:id/stock
 * @access  Private (Admin, Mechanic)
 */
const updatePartStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity, operation = 'add' } = req.body; // operation: 'add' or 'subtract'

  if (!quantity || quantity <= 0) {
    throw new AppError('Quantity must be a positive number', 400);
  }

  // Check if part exists
  const existing = await db.query('SELECT quantity_in_stock FROM parts WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new AppError('Part not found', 404);
  }

  const currentStock = existing.rows[0].quantity_in_stock;

  let newStock;
  if (operation === 'add') {
    newStock = currentStock + quantity;
  } else if (operation === 'subtract') {
    newStock = currentStock - quantity;
    if (newStock < 0) {
      throw new AppError('Insufficient stock. Cannot subtract more than available quantity.', 400);
    }
  } else {
    throw new AppError('Invalid operation. Use "add" or "subtract"', 400);
  }

  const result = await db.query(
    'UPDATE parts SET quantity_in_stock = $1 WHERE id = $2 RETURNING *',
    [newStock, id]
  );

  successResponse(res, 200, `Stock ${operation === 'add' ? 'added' : 'subtracted'} successfully`, {
    part: result.rows[0]
  });
});

module.exports = {
  getParts,
  getPart,
  createPart,
  updatePart,
  deletePart,
  getLowStockParts,
  updatePartStock,
};
