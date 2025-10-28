-- ============================================
-- SEED SUPER ADMIN USER
-- ============================================
-- Password: Admin@1234 (hashed with bcrypt)
-- This creates a super admin user for initial system access
-- Delete existing admin if exists
DELETE FROM users
WHERE email = 'admin@muhoya.com';
-- Insert Super Admin
INSERT INTO users (
    fullname,
    email,
    password,
    role,
    created_at,
    updated_at
  )
VALUES (
    'Super Admin',
    'admin@muhoya.com',
    '$2b$10$YourHashedPasswordHere',
    -- We'll generate this properly
    'admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
-- Note: To generate the password hash, run this Node.js script:
-- const bcrypt = require('bcrypt');
-- bcrypt.hash('Admin@1234', 10, (err, hash) => { console.log(hash); });