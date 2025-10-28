require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./config/database');

async function seedSuperAdmin() {
  try {
    console.log('🌱 Seeding Super Admin user...');
    
    const email = 'admin@muhoya.com';
    const password = 'Admin@1234';
    const fullname = 'Super Admin';
    const role = 'admin';
    
    // Check if admin already exists
    const existingAdmin = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Super Admin already exists. Updating password...');
      
      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      // Update existing admin
      await db.query(
        'UPDATE users SET password = $1, fullname = $2, role = $3, updated_at = CURRENT_TIMESTAMP WHERE email = $4',
        [password_hash, fullname, role, email]
      );
      
      console.log('✅ Super Admin password updated successfully!');
    } else {
      console.log('Creating new Super Admin...');
      
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      // Insert new admin
      await db.query(
        `INSERT INTO users (fullname, email, password, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [fullname, email, password_hash, role]
      );
      
      console.log('✅ Super Admin created successfully!');
    }
    
    console.log('\n📧 Email: admin@muhoya.com');
    console.log('🔑 Password: Admin@1234');
    console.log('👤 Role: admin\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
    process.exit(1);
  }
}

seedSuperAdmin();
