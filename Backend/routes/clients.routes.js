const express = require('express');
const router = express.Router();
const {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientVehicles,
  getClientServices,
  createClientWithVehicles,
} = require('../controllers/clientsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { clientValidation, commonValidation } = require('../middleware/validators');
const validate = require('../middleware/validate');

// Protect all routes with authentication
router.use(authenticateToken);

router.get('/', commonValidation.pagination, validate, getClients);
router.get('/:id', commonValidation.idParam, validate, getClient);
router.get('/:id/vehicles', commonValidation.idParam, commonValidation.pagination, validate, getClientVehicles);
router.get('/:id/services', commonValidation.idParam, commonValidation.pagination, validate, getClientServices);

router.post(
  '/with-vehicles',
  authorizeRoles('admin', 'receptionist'),
  createClientWithVehicles
);

router.post(
  '/',
  authorizeRoles('admin', 'receptionist'),
  clientValidation.create,
  validate,
  createClient
);

router.put(
  '/:id',
  authorizeRoles('admin', 'receptionist'),
  clientValidation.update,
  validate,
  updateClient
);

// Admin only
router.delete(
  '/:id',
  authorizeRoles('admin'),
  commonValidation.idParam,
  validate,
  deleteClient
);

module.exports = router;
