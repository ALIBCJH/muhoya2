const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleServices,
} = require('../controllers/vehiclesController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { vehicleValidation, commonValidation } = require('../middleware/validators');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

router.get('/', commonValidation.pagination, validate, getVehicles);
router.get('/:id', commonValidation.idParam, validate, getVehicle);
router.get('/:id/services', commonValidation.idParam, commonValidation.pagination, validate, getVehicleServices);

// Admin and Receptionist only
router.post(
  '/',
  authorizeRoles('admin', 'receptionist'),
  vehicleValidation.create,
  validate,
  createVehicle
);

router.put(
  '/:id',
  authorizeRoles('admin', 'receptionist'),
  vehicleValidation.update,
  validate,
  updateVehicle
);

// Admin only
router.delete(
  '/:id',
  authorizeRoles('admin'),
  commonValidation.idParam,
  validate,
  deleteVehicle
);

module.exports = router;
