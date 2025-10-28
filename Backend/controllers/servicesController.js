const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { AppError } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');

/**
 * GET /api/services
 */
const getServices = asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT s.*,
           v.registration_number,
           v.make_model,
           COALESCE(o.name, c.name) AS owner_name
    FROM service_records s
    JOIN vehicles v ON s.vehicle_id = v.id
    LEFT JOIN organizations o ON v.organization_id = o.id
    LEFT JOIN clients c ON v.client_id = c.id
    ORDER BY s.service_date DESC;
  `);

  successResponse(res, 200, 'Services fetched successfully', result.rows);
});

/**
 * GET /api/services/:id
 */
const getService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await db.query(`
    SELECT s.*,
           v.registration_number,
           v.make_model,
           COALESCE(o.name, c.name) AS owner_name
    FROM service_records s
    JOIN vehicles v ON s.vehicle_id = v.id
    LEFT JOIN organizations o ON v.organization_id = o.id
    LEFT JOIN clients c ON v.client_id = c.id
    WHERE s.id = $1;
  `, [id]);

  if (result.rows.length === 0) throw new AppError('Service record not found', 404);

  // also fetch service parts
  const partsRes = await db.query(`
    SELECT sp.*, p.part_name, p.part_code
    FROM service_parts sp
    JOIN parts p ON sp.part_id = p.id
    WHERE sp.service_id = $1;
  `, [id]);

  const service = result.rows[0];
  service.parts = partsRes.rows;

  successResponse(res, 200, 'Service fetched successfully', service);
});

/**
 * POST /api/services
 *
 * Expects:
 * {
 *   vehicle_id,
 *   description,
 *   labour_cost,
 *   parts: [{ part_id, quantity, unit_price }],
 *   status,
 *   payment_method,
 *   payment_reference,
 *   notes
 * }
 */
const createService = asyncHandler(async (req, res) => {
  const {
    vehicle_id,
    description = null,
    labour_cost = 0,
    parts = [],
    status = 'pending',
    notes = '',
    payment_method = null,
    payment_reference = null,
    service_date = null
  } = req.body;

  // validate vehicle
  const vehicleCheck = await db.query('SELECT id FROM vehicles WHERE id = $1', [vehicle_id]);
  if (vehicleCheck.rows.length === 0) throw new AppError('Vehicle not found', 404);

  // compute parts total
  const partsTotal = parts.reduce((sum, p) => {
    const qty = Number(p.quantity || 0);
    const price = Number(p.unit_price || 0);
    return sum + qty * price;
  }, 0);

  const totalAmount = Number(labour_cost || 0) + partsTotal;

  // transaction: insert service_records, insert service_parts, update stock
  const created = await db.transaction(async (client) => {
    const insertService = `
      INSERT INTO service_records (
        vehicle_id, service_date, description, mileage,
        labour_cost, parts_total, total_amount,
        status, mechanic_name, notes
      ) VALUES ($1, COALESCE($2, CURRENT_DATE), $3, NULL, $4, $5, $6, $7, NULL, $8)
      RETURNING *;
    `;

    const svcRes = await client.query(insertService, [
      vehicle_id,
      service_date,
      description,
      labour_cost,
      partsTotal,
      totalAmount,
      status,
      notes
    ]);

    const service = svcRes.rows[0];

    // insert parts and update stock
    if (parts && parts.length > 0) {
      for (const p of parts) {
        // validate part exists and stock
        const pRes = await client.query('SELECT id, stock_quantity FROM parts WHERE id = $1 FOR UPDATE', [p.part_id]);
        if (pRes.rows.length === 0) throw new AppError(`Part with ID ${p.part_id} not found`, 404);

        const stock = Number(pRes.rows[0].stock_quantity || 0);
        const qty = Number(p.quantity);
        if (stock < qty) throw new AppError(`Insufficient stock for part ID ${p.part_id}. Available: ${stock}`, 400);

        // insert into service_parts
        await client.query(`
          INSERT INTO service_parts (service_id, part_id, quantity, unit_price, subtotal)
          VALUES ($1,$2,$3,$4,$5)
        `, [service.id, p.part_id, qty, p.unit_price, qty * p.unit_price]);

        // decrement stock_quantity
        await client.query(`UPDATE parts SET stock_quantity = stock_quantity - $1 WHERE id = $2`, [qty, p.part_id]);
      }
    }

    return service;
  });

  successResponse(res, 201, 'Service record created successfully', created);
});

/**
 * PUT /api/services/:id
 * update status/notes/payment info
 */
const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes, payment_method, payment_reference } = req.body;

  const result = await db.query(`
    UPDATE service_records
    SET status = COALESCE($2, status),
        notes = COALESCE($3, notes)
    WHERE id = $1
    RETURNING *;
  `, [id, status, notes]);

  if (result.rows.length === 0) throw new AppError('Service not found', 404);

  // Optionally update payment fields on invoices or service_records separately if needed
  successResponse(res, 200, 'Service updated successfully', result.rows[0]);
});

/**
 * DELETE /api/services/:id
 */
const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await db.query(`DELETE FROM service_records WHERE id = $1 RETURNING *;`, [id]);
  if (result.rows.length === 0) throw new AppError('Service not found', 404);
  successResponse(res, 200, 'Service deleted successfully', result.rows[0]);
});

/**
 * POST /api/services/:id/parts
 * Add a single part to an existing service (admin/mechanic)
 * Expects: { part_id, quantity, unit_price }
 */
const addPartToService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { part_id, quantity, unit_price } = req.body;

  await db.transaction(async (client) => {
    const svcCheck = await client.query('SELECT id FROM service_records WHERE id = $1 FOR UPDATE', [id]);
    if (svcCheck.rows.length === 0) throw new AppError('Service not found', 404);

    const pRes = await client.query('SELECT id, stock_quantity FROM parts WHERE id = $1 FOR UPDATE', [part_id]);
    if (pRes.rows.length === 0) throw new AppError('Part not found', 404);

    const stock = Number(pRes.rows[0].stock_quantity || 0);
    if (stock < quantity) throw new AppError('Insufficient stock', 400);

    await client.query(`
      INSERT INTO service_parts (service_id, part_id, quantity, unit_price, subtotal)
      VALUES ($1,$2,$3,$4,$5)
    `, [id, part_id, quantity, unit_price, quantity * unit_price]);

    await client.query(`UPDATE parts SET stock_quantity = stock_quantity - $1 WHERE id = $2`, [quantity, part_id]);

    // update parts_total and total_amount on service_records
    const sumParts = await client.query(`
      SELECT COALESCE(SUM(subtotal), 0) AS parts_sum
      FROM service_parts WHERE service_id = $1
    `, [id]);

    const partsTotal = Number(sumParts.rows[0].parts_sum || 0);

    await client.query(`
      UPDATE service_records
      SET parts_total = $2,
          total_amount = COALESCE(labour_cost,0) + $2
      WHERE id = $1
    `, [id, partsTotal]);
  });

  successResponse(res, 201, 'Part added to service successfully');
});

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  addPartToService
};
