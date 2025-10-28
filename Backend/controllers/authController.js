const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { AppError } = require('../middleware/errorHandler');
const { successResponse } = require('../utils/helpers');

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
  const { email, password, full_name, fullname, role = 'receptionist' } = req.body;
  
  // Use either full_name or fullname (whichever is provided)
  const name = full_name || fullname;

  // Check if user already exists
  const existingUser = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  const password_hash = await bcrypt.hash(password, saltRounds);

  // Insert new user
  const result = await db.query(
    `INSERT INTO users (fullname, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, fullname, email, role, created_at`,
    [name, email, password_hash, role]
  );

  const user = result.rows[0];

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '7d' }
  );

  successResponse(res, 201, 'User registered successfully', {
    user: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    },
    token
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  console.log('Login request body:', req.body);
  const { email, password } = req.body;

  // Find user by email
  const result = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid email or password', 401);
  }

  const user = result.rows[0];

  // Check password (column is 'password' not 'password_hash')
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '7d' }
  );

  successResponse(res, 200, 'Login successful', {
    user: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    },
    token
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT id, username, email, full_name, role, created_at 
     FROM users 
     WHERE id = $1`,
    [req.user.id]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  successResponse(res, 200, 'User profile retrieved successfully', {
    user: result.rows[0]
  });
});

/**
 * @desc    Update user password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const result = await db.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [req.user.id]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);

  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Hash new password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  const password_hash = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await db.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [password_hash, req.user.id]
  );

  successResponse(res, 200, 'Password updated successfully');
});

module.exports = {
  signup,
  login,
  getMe,
  updatePassword,
};
