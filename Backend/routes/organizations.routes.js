const express = require('express');
const router = express.Router();
const {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationVehicles,
  createOrganizationWithVehicles,
} = require('../controllers/organizationsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { organizationValidation, commonValidation } = require('../middleware/validators');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

router.get('/', commonValidation.pagination, validate, getOrganizations);
router.get('/:id', commonValidation.idParam, validate, getOrganization);
router.get('/:id/vehicles', commonValidation.idParam, commonValidation.pagination, validate, getOrganizationVehicles);

// Admin and Receptionist only
router.post(
  '/with-vehicles',
  authorizeRoles('admin', 'receptionist'),
  createOrganizationWithVehicles
);

router.post(
  '/',
  authorizeRoles('admin', 'receptionist'),
  organizationValidation.create,
  validate,
  createOrganization
);

router.put(
  '/:id',
  authorizeRoles('admin', 'receptionist'),
  organizationValidation.update,
  validate,
  updateOrganization
);

// Admin only
router.delete(
  '/:id',
  authorizeRoles('admin'),
  commonValidation.idParam,
  validate,
  deleteOrganization
);

module.exports = router;
