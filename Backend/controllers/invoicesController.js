const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { AppError } = require('../middleware/errorHandler');
const { successResponse, getPagination, buildPaginationResponse } = require('../utils/helpers');

/**
 * @desc    Get all invoices
 * @route   GET /api/invoices
 * @access  Private
 */
const getInvoices = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req);
  const { search, payment_status, start_date, end_date } = req.query;

  let query = `
    SELECT i.*, 
           v.license_plate, v.make, v.model,
           COALESCE(o.name, c.full_name) as customer_name
    FROM invoices i
    JOIN service_records sr ON i.service_record_id = sr.id
    JOIN vehicles v ON sr.vehicle_id = v.id
    LEFT JOIN organizations o ON v.organization_id = o.id
    LEFT JOIN clients c ON v.client_id = c.id
  `;

  let countQuery = `
    SELECT COUNT(*) FROM invoices i
    JOIN service_records sr ON i.service_record_id = sr.id
    JOIN vehicles v ON sr.vehicle_id = v.id
  `;

  const queryParams = [];
  const conditions = [];
  let paramIndex = 1;

  if (search) {
    conditions.push(`(i.invoice_number ILIKE $${paramIndex} OR v.license_plate ILIKE $${paramIndex})`);
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  if (payment_status) {
    conditions.push(`i.payment_status = $${paramIndex}`);
    queryParams.push(payment_status);
    paramIndex++;
  }

  if (start_date) {
    conditions.push(`i.issue_date >= $${paramIndex}`);
    queryParams.push(start_date);
    paramIndex++;
  }

  if (end_date) {
    conditions.push(`i.issue_date <= $${paramIndex}`);
    queryParams.push(end_date);
    paramIndex++;
  }

  if (conditions.length > 0) {
    const whereClause = ` WHERE ${conditions.join(' AND ')}`;
    query += whereClause;
    countQuery += whereClause;
  }

  query += ' ORDER BY i.issue_date DESC';
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
 * @desc    Get single invoice
 * @route   GET /api/invoices/:id
 * @access  Private
 */
const getInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get invoice with full details
  const invoiceResult = await db.query(
    `SELECT i.*, 
            sr.description as service_description, sr.labor_cost, sr.service_date,
            v.license_plate, v.make, v.model, v.year, v.vin,
            o.name as organization_name, o.contact_person, o.email as org_email, o.phone as org_phone, o.address as org_address,
            c.full_name as client_name, c.email as client_email, c.phone as client_phone, c.address as client_address,
            u.full_name as mechanic_name
     FROM invoices i
     JOIN service_records sr ON i.service_record_id = sr.id
     JOIN vehicles v ON sr.vehicle_id = v.id
     LEFT JOIN organizations o ON v.organization_id = o.id
     LEFT JOIN clients c ON v.client_id = c.id
     LEFT JOIN users u ON sr.mechanic_id = u.id
     WHERE i.id = $1`,
    [id]
  );

  if (invoiceResult.rows.length === 0) {
    throw new AppError('Invoice not found', 404);
  }

  // Get invoice items (parts used)
  const itemsResult = await db.query(
    `SELECT ii.*, p.part_name, p.part_number
     FROM invoice_items ii
     JOIN parts p ON ii.part_id = p.id
     WHERE ii.invoice_id = $1
     ORDER BY ii.id`,
    [id]
  );

  const invoiceData = {
    ...invoiceResult.rows[0],
    items: itemsResult.rows
  };

  successResponse(res, 200, 'Invoice retrieved successfully', {
    invoice: invoiceData
  });
});

/**
 * @desc    Create new invoice
 * @route   POST /api/invoices
 * @access  Private (Admin, Receptionist)
 */
const createInvoice = asyncHandler(async (req, res) => {
  const { service_record_id, discount = 0, tax_rate = 16, payment_method } = req.body;

  // Check if service record exists and is completed
  const serviceCheck = await db.query(
    'SELECT id, status FROM service_records WHERE id = $1',
    [service_record_id]
  );

  if (serviceCheck.rows.length === 0) {
    throw new AppError('Service record not found', 404);
  }

  if (serviceCheck.rows[0].status !== 'completed') {
    throw new AppError('Cannot create invoice for incomplete service', 400);
  }

  // Check if invoice already exists for this service
  const existingInvoice = await db.query(
    'SELECT id FROM invoices WHERE service_record_id = $1',
    [service_record_id]
  );

  if (existingInvoice.rows.length > 0) {
    throw new AppError('Invoice already exists for this service record', 409);
  }

  // Start transaction
  const invoice = await db.transaction(async (transactionClient) => {
    // Get labor cost
    const laborResult = await transactionClient.query(
      'SELECT labor_cost FROM service_records WHERE id = $1',
      [service_record_id]
    );

    const labor_cost = parseFloat(laborResult.rows[0].labor_cost) || 0;

    // Get parts used and calculate parts total
    const partsResult = await transactionClient.query(
      `SELECT sp.part_id, sp.quantity, p.price
       FROM service_parts sp
       JOIN parts p ON sp.part_id = p.id
       WHERE sp.service_record_id = $1`,
      [service_record_id]
    );

    let parts_cost = 0;
    for (const part of partsResult.rows) {
      parts_cost += parseFloat(part.price) * parseInt(part.quantity);
    }

    // Calculate totals
    const subtotal = labor_cost + parts_cost;
    const discount_amount = (subtotal * parseFloat(discount)) / 100;
    const subtotal_after_discount = subtotal - discount_amount;
    const tax_amount = (subtotal_after_discount * parseFloat(tax_rate)) / 100;
    const total_amount = subtotal_after_discount + tax_amount;

    // Create invoice
    const invoiceResult = await transactionClient.query(
      `INSERT INTO invoices (service_record_id, subtotal, discount, tax_rate, tax_amount, total_amount, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [service_record_id, subtotal, discount, tax_rate, tax_amount, total_amount, payment_method]
    );

    const newInvoice = invoiceResult.rows[0];

    // Create invoice items for parts
    for (const part of partsResult.rows) {
      const item_total = parseFloat(part.price) * parseInt(part.quantity);
      await transactionClient.query(
        `INSERT INTO invoice_items (invoice_id, part_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [newInvoice.id, part.part_id, part.quantity, part.price, item_total]
      );
    }

    return newInvoice;
  });

  // Fetch complete invoice data
  const completeInvoice = await db.query(
    `SELECT i.*, v.license_plate, v.make, v.model,
            COALESCE(o.name, c.full_name) as customer_name
     FROM invoices i
     JOIN service_records sr ON i.service_record_id = sr.id
     JOIN vehicles v ON sr.vehicle_id = v.id
     LEFT JOIN organizations o ON v.organization_id = o.id
     LEFT JOIN clients c ON v.client_id = c.id
     WHERE i.id = $1`,
    [invoice.id]
  );

  successResponse(res, 201, 'Invoice created successfully', {
    invoice: completeInvoice.rows[0]
  });
});

/**
 * @desc    Update invoice
 * @route   PUT /api/invoices/:id
 * @access  Private (Admin, Receptionist)
 */
const updateInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Check if invoice exists
  const existing = await db.query('SELECT id, payment_status FROM invoices WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new AppError('Invoice not found', 404);
  }

  // Build dynamic update query
  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  const allowedFields = ['payment_status', 'payment_method', 'discount', 'tax_rate'];
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

  // If payment_status is being updated to 'paid', set payment_date
  if (updates.payment_status === 'paid') {
    updateFields.push(`payment_date = CURRENT_TIMESTAMP`);
  }

  values.push(id);
  const query = `UPDATE invoices SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

  const result = await db.query(query, values);

  successResponse(res, 200, 'Invoice updated successfully', {
    invoice: result.rows[0]
  });
});

/**
 * @desc    Delete invoice
 * @route   DELETE /api/invoices/:id
 * @access  Private (Admin)
 */
const deleteInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Start transaction
  await db.transaction(async (transactionClient) => {
    // Delete invoice items first
    await transactionClient.query('DELETE FROM invoice_items WHERE invoice_id = $1', [id]);

    // Delete invoice
    const deleteResult = await transactionClient.query(
      'DELETE FROM invoices WHERE id = $1 RETURNING id',
      [id]
    );

    if (deleteResult.rows.length === 0) {
      throw new AppError('Invoice not found', 404);
    }
  });

  successResponse(res, 200, 'Invoice deleted successfully');
});

/**
 * @desc    Get revenue statistics
 * @route   GET /api/invoices/stats/revenue
 * @access  Private (Admin)
 */
const getRevenueStats = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const currentYear = year || new Date().getFullYear();

  let query = 'SELECT * FROM monthly_revenue WHERE year = $1';
  const params = [currentYear];

  if (month) {
    query += ' AND month = $2';
    params.push(month);
  }

  query += ' ORDER BY month';

  const result = await db.query(query, params);

  successResponse(res, 200, 'Revenue statistics retrieved successfully', {
    revenue: result.rows
  });
});

/**
 * @desc    Mark invoice as paid
 * @route   PATCH /api/invoices/:id/pay
 * @access  Private (Admin, Receptionist)
 */
const markInvoiceAsPaid = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { payment_method } = req.body;

  const result = await db.query(
    `UPDATE invoices 
     SET payment_status = 'paid', 
         payment_date = CURRENT_TIMESTAMP,
         payment_method = COALESCE($2, payment_method)
     WHERE id = $1 
     RETURNING *`,
    [id, payment_method]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invoice not found', 404);
  }

  successResponse(res, 200, 'Invoice marked as paid successfully', {
    invoice: result.rows[0]
  });
});

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getRevenueStats,
  markInvoiceAsPaid,
};
