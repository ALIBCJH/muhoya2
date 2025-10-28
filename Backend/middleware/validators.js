const { body, param, query } = require('express-validator');

/**
 * Authentication Validation Schemas
 */
const authValidation = {
  signup: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body()
      .custom((value, { req }) => {
        // Accept either full_name or fullname
        if (!req.body.full_name && !req.body.fullname) {
          throw new Error('Full name is required');
        }
        const name = req.body.full_name || req.body.fullname;
        if (name.trim().length < 2 || name.trim().length > 100) {
          throw new Error('Full name must be between 2 and 100 characters');
        }
        return true;
      }),
    
    body('role')
      .optional()
      .isIn(['admin', 'mechanic', 'receptionist'])
      .withMessage('Role must be admin, mechanic, or receptionist')
  ],
  
  login: [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ]
};

/**
 * Organization Validation Schemas
 */
const organizationValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Organization name must be between 2 and 200 characters'),
    
    body('contact_person')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Contact person name must not exceed 100 characters'),
    
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('phone')
      .optional()
      .trim()
      .matches(/^[+]?[\d\s()-]+$/)
      .withMessage('Please provide a valid phone number'),
    
    body('address')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Address must not exceed 500 characters')
  ],
  
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid organization ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 200 })
      .withMessage('Organization name must be between 2 and 200 characters'),
    
    body('contact_person')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Contact person name must not exceed 100 characters'),
    
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('phone')
      .optional()
      .trim()
      .matches(/^[+]?[\d\s()-]+$/)
      .withMessage('Please provide a valid phone number'),
    
    body('address')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Address must not exceed 500 characters')
  ]
};

/**
 * Client Validation Schemas
 */
const clientValidation = {
  create: [
    body('full_name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('phone')
      .trim()
      .matches(/^[+]?[\d\s()-]+$/)
      .withMessage('Please provide a valid phone number'),
    
    body('address')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Address must not exceed 500 characters')
  ],
  
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid client ID'),
    body('full_name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('phone')
      .optional()
      .trim()
      .matches(/^[+]?[\d\s()-]+$/)
      .withMessage('Please provide a valid phone number'),
    
    body('address')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Address must not exceed 500 characters')
  ]
};

/**
 * Vehicle Validation Schemas
 */
const vehicleValidation = {
  create: [
    body('license_plate')
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('License plate must be between 1 and 20 characters')
      .matches(/^[A-Z0-9\s-]+$/i)
      .withMessage('License plate can only contain letters, numbers, spaces, and hyphens'),
    
    body('make')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Make must be between 1 and 50 characters'),
    
    body('model')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Model must be between 1 and 50 characters'),
    
    body('year')
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),
    
    body('color')
      .optional()
      .trim()
      .isLength({ max: 30 })
      .withMessage('Color must not exceed 30 characters'),
    
    body('vin')
      .optional()
      .trim()
      .isLength({ min: 17, max: 17 })
      .withMessage('VIN must be exactly 17 characters')
      .matches(/^[A-HJ-NPR-Z0-9]+$/i)
      .withMessage('Invalid VIN format'),
    
    body('organization_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Invalid organization ID'),
    
    body('client_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Invalid client ID'),
    
    body().custom((value, { req }) => {
      if (!req.body.organization_id && !req.body.client_id) {
        throw new Error('Either organization_id or client_id must be provided');
      }
      if (req.body.organization_id && req.body.client_id) {
        throw new Error('Cannot assign vehicle to both organization and client');
      }
      return true;
    })
  ],
  
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid vehicle ID'),
    body('license_plate')
      .optional()
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('License plate must be between 1 and 20 characters'),
    
    body('make')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Make must be between 1 and 50 characters'),
    
    body('model')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Model must be between 1 and 50 characters'),
    
    body('year')
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),
    
    body('color')
      .optional()
      .trim()
      .isLength({ max: 30 })
      .withMessage('Color must not exceed 30 characters')
  ]
};

/**
 * Part Validation Schemas
 */
const partValidation = {
  create: [
    body('part_name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Part name must be between 1 and 100 characters'),
    
    body('part_number')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Part number must not exceed 50 characters'),
    
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    
    body('quantity_in_stock')
      .isInt({ min: 0 })
      .withMessage('Quantity must be a non-negative integer'),
    
    body('reorder_level')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Reorder level must be a non-negative integer')
  ],
  
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid part ID'),
    body('part_name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Part name must be between 1 and 100 characters'),
    
    body('part_number')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Part number must not exceed 50 characters'),
    
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    
    body('quantity_in_stock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Quantity must be a non-negative integer'),
    
    body('reorder_level')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Reorder level must be a non-negative integer')
  ]
};

/**
 * Service Record Validation Schemas
 */
const serviceValidation = {
  create: [
    body('vehicle_id')
      .isInt({ min: 1 })
      .withMessage('Invalid vehicle ID'),
    
    body('description')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Description is required'),
    
    body('labor_cost')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Labor cost must be a positive number'),
    
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed'])
      .withMessage('Status must be pending, in_progress, or completed'),
    
    body('parts')
      .optional()
      .isArray()
      .withMessage('Parts must be an array'),
    
    body('parts.*.part_id')
      .isInt({ min: 1 })
      .withMessage('Invalid part ID'),
    
    body('parts.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1')
  ],
  
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid service record ID'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Description cannot be empty'),
    
    body('labor_cost')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Labor cost must be a positive number'),
    
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed'])
      .withMessage('Status must be pending, in_progress, or completed')
  ]
};

/**
 * Invoice Validation Schemas
 */
const invoiceValidation = {
  create: [
    body('service_record_id')
      .isInt({ min: 1 })
      .withMessage('Invalid service record ID'),
    
    body('discount')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Discount must be between 0 and 100'),
    
    body('tax_rate')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Tax rate must be between 0 and 100'),
    
    body('payment_method')
      .optional()
      .isIn(['cash', 'card', 'mpesa', 'bank_transfer', 'cheque'])
      .withMessage('Invalid payment method')
  ],
  
  update: [
    param('id').isInt({ min: 1 }).withMessage('Invalid invoice ID'),
    body('discount')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Discount must be between 0 and 100'),
    
    body('tax_rate')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Tax rate must be between 0 and 100'),
    
    body('payment_status')
      .optional()
      .isIn(['unpaid', 'paid', 'partially_paid'])
      .withMessage('Invalid payment status'),
    
    body('payment_method')
      .optional()
      .isIn(['cash', 'card', 'mpesa', 'bank_transfer', 'cheque'])
      .withMessage('Invalid payment method')
  ]
};

/**
 * Common Validation Schemas
 */
const commonValidation = {
  idParam: [
    param('id').isInt({ min: 1 }).withMessage('Invalid ID')
  ],
  
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

module.exports = {
  authValidation,
  organizationValidation,
  clientValidation,
  vehicleValidation,
  partValidation,
  serviceValidation,
  invoiceValidation,
  commonValidation,
};
