const express = require('express');
const router = express.Router();
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  addPartToService,
} = require('../controllers/servicesController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { serviceValidation, commonValidation } = require('../middleware/validators');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

router.get('/', commonValidation.pagination, validate, getServices);
router.get('/:id', commonValidation.idParam, validate, getService);

// All authenticated users can create service records
router.post(
  '/',
  serviceValidation.create,
  validate,
  createService
);

// Admin and Mechanic only
router.put(
  '/:id',
  authorizeRoles('admin', 'mechanic'),
  serviceValidation.update,
  validate,
  updateService
);

router.post(
  '/:id/parts',
  authorizeRoles('admin', 'mechanic'),
  addPartToService
);

// Admin only
router.delete(
  '/:id',
  authorizeRoles('admin'),
  commonValidation.idParam,
  validate,
  deleteService
);

module.exports = router;
