const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getRevenueStats,
  markInvoiceAsPaid,
} = require('../controllers/invoicesController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { invoiceValidation, commonValidation } = require('../middleware/validators');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

router.get('/', commonValidation.pagination, validate, getInvoices);
router.get('/stats/revenue', authorizeRoles('admin'), getRevenueStats);
router.get('/:id', commonValidation.idParam, validate, getInvoice);

// Admin and Receptionist only
router.post(
  '/',
  authorizeRoles('admin', 'receptionist'),
  invoiceValidation.create,
  validate,
  createInvoice
);

router.put(
  '/:id',
  authorizeRoles('admin', 'receptionist'),
  invoiceValidation.update,
  validate,
  updateInvoice
);

router.patch(
  '/:id/pay',
  authorizeRoles('admin', 'receptionist'),
  markInvoiceAsPaid
);

// Admin only
router.delete(
  '/:id',
  authorizeRoles('admin'),
  commonValidation.idParam,
  validate,
  deleteInvoice
);

module.exports = router;
