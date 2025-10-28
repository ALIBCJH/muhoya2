/**
 * Pagination Helper
 * @param {Object} req - Express request object
 * @returns {Object} - Pagination params
 */
const getPagination = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 20;
  const maxLimit = parseInt(process.env.MAX_PAGE_SIZE) || 100;
  
  const finalLimit = Math.min(limit, maxLimit);
  const offset = (page - 1) * finalLimit;
  
  return {
    page,
    limit: finalLimit,
    offset
  };
};

/**
 * Build Pagination Response
 * @param {Object} data - Query result data
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total count
 * @returns {Object} - Paginated response
 */
const buildPaginationResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

/**
 * Success Response Helper
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object} data - Response data
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Error Response Helper
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Object} errors - Validation errors
 */
const errorResponse = (res, statusCode = 500, message = 'Error', errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Build SQL WHERE clause from query parameters
 * @param {Object} filters - Filter parameters
 * @returns {Object} - WHERE clause and values
 */
const buildWhereClause = (filters) => {
  const conditions = [];
  const values = [];
  let paramIndex = 1;
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
      conditions.push(`${key} = $${paramIndex}`);
      values.push(filters[key]);
      paramIndex++;
    }
  });
  
  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values
  };
};

module.exports = {
  getPagination,
  buildPaginationResponse,
  successResponse,
  errorResponse,
  buildWhereClause,
};
