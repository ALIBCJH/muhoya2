const express = require('express');
const router = express.Router();
const {
  getParts,
  getPart,
  createPart,
  updatePart,
  deletePart,
  getLowStockParts,
  updatePartStock,
} = require('../controllers/partsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { partValidation, commonValidation } = require('../middleware/validators');
const validate = require('../middleware/validate');

// All routes require authentication
router.use(authenticateToken);

router.get('/', commonValidation.pagination, validate, getParts);
router.get('/alerts/low-stock', getLowStockParts);
router.get('/:id', commonValidation.idParam, validate, getPart);

// Admin and Mechanic only
router.post(
  '/',
  authorizeRoles('admin', 'mechanic'),
  partValidation.create,
  validate,
  createPart
);

router.put(
  '/:id',
  authorizeRoles('admin', 'mechanic'),
  partValidation.update,
  validate,
  updatePart
);

router.patch(
  '/:id/stock',
  authorizeRoles('admin', 'mechanic'),
  updatePartStock
);

// Admin only
router.delete(
  '/:id',
  authorizeRoles('admin'),
  commonValidation.idParam,
  validate,
  deletePart
);

module.exports = router;
