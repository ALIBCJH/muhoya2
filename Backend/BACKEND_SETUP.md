# Backend Setup Guide

## Prerequisites

Ensure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v13 or higher)
- **npm** or **yarn**

## Quick Start

### 1. Clone the Repository

```bash
cd Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL Database

#### Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE garage_db;

# Exit psql
\q
```

### 4. Configure Environment Variables

Create a `.env` file in the `Backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=garage_db
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRATION=7d

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Security
BCRYPT_ROUNDS=10

# Pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

**Important:** Change `JWT_SECRET` to a random secure string in production!

### 5. Initialize Database Schema

Run the schema file to create all tables, views, triggers, and functions:

```bash
npm run db:setup
```

Or manually:

```bash
psql -U postgres -d garage_db -f database/schema.sql
```

### 6. (Optional) Seed Database with Test Data

Populate the database with sample data for testing:

```bash
npm run db:seed
```

Or manually:

```bash
psql -U postgres -d garage_db -f database/seed.sql
```

### 7. Start the Server

#### Development Mode (with auto-reload)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

---

## Test the Installation

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "database": "connected"
}
```

### 2. Test Login (if you seeded the database)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@garage.com",
    "password": "Admin@123"
  }'
```

You should receive a token in the response.

### 3. Test Protected Endpoint

```bash
# Replace YOUR_TOKEN with the token from step 2
curl http://localhost:3000/api/vehicles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Project Structure

```
Backend/
├── config/
│   └── database.js          # PostgreSQL connection pool
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── clientsController.js
│   ├── invoicesController.js
│   ├── organizationsController.js
│   ├── partsController.js
│   ├── servicesController.js
│   └── vehiclesController.js
├── database/
│   ├── schema.sql           # Database schema
│   └── seed.sql             # Sample data
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── errorHandler.js      # Global error handling
│   ├── validate.js          # Validation error handler
│   └── validators.js        # Input validation schemas
├── routes/
│   ├── auth.routes.js
│   ├── clients.routes.js
│   ├── invoices.routes.js
│   ├── organizations.routes.js
│   ├── parts.routes.js
│   ├── services.routes.js
│   └── vehicles.routes.js
├── utils/
│   └── helpers.js           # Utility functions
├── .env.example             # Environment variables template
├── .env                     # Your environment variables (create this)
├── server.js                # Express app entry point
├── package.json
└── API_DOCUMENTATION.md     # Complete API documentation
```

---

## Database Schema Overview

### Tables

1. **users** - System users (admin, mechanic, receptionist)
2. **organizations** - Fleet customers (companies)
3. **clients** - Individual customers (walk-ins)
4. **vehicles** - Cars/trucks owned by organizations or clients
5. **parts** - Spare parts inventory
6. **service_records** - Service/repair records
7. **service_parts** - Junction table (many-to-many: services ↔ parts)
8. **invoices** - Billing documents
9. **invoice_items** - Individual line items on invoices

### Views

1. **vehicles_with_owners** - Vehicles with owner information
2. **service_records_detailed** - Services with all related data
3. **invoices_detailed** - Invoices with full details
4. **low_stock_parts** - Parts below reorder level
5. **monthly_revenue** - Revenue statistics by month

### Key Features

- **Auto-generated invoice numbers** (INV-YYYY-0001)
- **Automatic timestamp updates** (updated_at triggers)
- **Stock management** (automatic deduction when parts are used)
- **Single owner constraint** (vehicle belongs to org XOR client)
- **Cascading relationships** (proper foreign keys)

---

## Seeded User Accounts

If you ran the seed script, use these credentials:

| Email                | Password      | Role         |
| -------------------- | ------------- | ------------ |
| admin@garage.com     | Admin@123     | admin        |
| mechanic@garage.com  | Mechanic@123  | mechanic     |
| reception@garage.com | Reception@123 | receptionist |

**Change these passwords in production!**

---

## Common npm Scripts

```bash
# Start server (production)
npm start

# Start server with auto-reload (development)
npm run dev

# Initialize database schema
npm run db:setup

# Seed database with test data
npm run db:seed
```

---

## API Endpoints Summary

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password

### Organizations (Fleet Customers)

- `GET /api/organizations` - List all
- `GET /api/organizations/:id` - Get one
- `POST /api/organizations` - Create
- `PUT /api/organizations/:id` - Update
- `DELETE /api/organizations/:id` - Delete
- `GET /api/organizations/:id/vehicles` - Get org vehicles

### Clients (Individual Customers)

- `GET /api/clients` - List all
- `GET /api/clients/:id` - Get one
- `POST /api/clients` - Create
- `PUT /api/clients/:id` - Update
- `DELETE /api/clients/:id` - Delete
- `GET /api/clients/:id/vehicles` - Get client vehicles
- `GET /api/clients/:id/services` - Get service history

### Vehicles

- `GET /api/vehicles` - List all
- `GET /api/vehicles/:id` - Get one
- `POST /api/vehicles` - Create
- `PUT /api/vehicles/:id` - Update
- `DELETE /api/vehicles/:id` - Delete
- `GET /api/vehicles/:id/services` - Get service history

### Parts (Inventory)

- `GET /api/parts` - List all
- `GET /api/parts/:id` - Get one
- `POST /api/parts` - Create
- `PUT /api/parts/:id` - Update
- `DELETE /api/parts/:id` - Delete
- `GET /api/parts/alerts/low-stock` - Get low stock alerts
- `PATCH /api/parts/:id/stock` - Update stock quantity

### Service Records

- `GET /api/services` - List all
- `GET /api/services/:id` - Get one
- `POST /api/services` - Create
- `PUT /api/services/:id` - Update
- `DELETE /api/services/:id` - Delete
- `POST /api/services/:id/parts` - Add part to service

### Invoices

- `GET /api/invoices` - List all
- `GET /api/invoices/:id` - Get one
- `POST /api/invoices` - Create
- `PUT /api/invoices/:id` - Update
- `DELETE /api/invoices/:id` - Delete
- `PATCH /api/invoices/:id/pay` - Mark as paid
- `GET /api/invoices/stats/revenue` - Revenue statistics

See `API_DOCUMENTATION.md` for detailed request/response examples.

---

## Role-Based Access Control

### Admin

- Full access to all endpoints
- Can delete records
- Can view revenue statistics

### Mechanic

- Can manage parts inventory
- Can create and update service records
- Can add parts to services
- Cannot delete records or manage users

### Receptionist

- Can manage organizations, clients, vehicles
- Can create invoices
- Can mark invoices as paid
- Cannot delete records or manage parts

---

## Troubleshooting

### Issue: "Connection refused" error

**Solution:**

1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Start if needed: `sudo systemctl start postgresql`
3. Verify credentials in `.env` file

### Issue: "relation does not exist" error

**Solution:**
Run the schema setup:

```bash
npm run db:setup
```

### Issue: "JWT malformed" or "Invalid token"

**Solution:**

1. Check that `JWT_SECRET` is set in `.env`
2. Ensure token format is: `Bearer <token>`
3. Token might be expired (7 days) - login again

### Issue: Port 3000 already in use

**Solution:**

1. Change `PORT` in `.env` file
2. Or kill the process using port 3000:

```bash
lsof -ti:3000 | xargs kill -9
```

### Issue: "Cannot delete X with existing Y"

**Solution:**
This is intentional to maintain data integrity. Options:

1. Delete related records first
2. Reassign related records to another entity
3. If you really need to delete, remove the foreign key constraint

### Issue: Validation errors

**Solution:**

- Check the API documentation for required fields and formats
- Ensure data types match (numbers as numbers, not strings)
- Email must be valid format
- Password must contain uppercase, lowercase, and number

---

## Development Tips

### 1. Testing with cURL

Create a `.sh` file with common requests:

```bash
#!/bin/bash

# Login and save token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@garage.com","password":"Admin@123"}' \
  | jq -r '.data.token')

# Use token for authenticated requests
curl http://localhost:3000/api/vehicles \
  -H "Authorization: Bearer $TOKEN" | jq

# Create a new client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "full_name": "Test Client",
    "phone": "+254700000000",
    "email": "test@example.com"
  }' | jq
```

### 2. Database Management

```bash
# Connect to database
psql -U postgres -d garage_db

# View all tables
\dt

# Describe a table
\d vehicles

# View a view
\d+ vehicles_with_owners

# See all triggers
SELECT * FROM information_schema.triggers;

# Reset database (caution!)
DROP DATABASE garage_db;
CREATE DATABASE garage_db;
# Then run schema and seed again
```

### 3. Logging

The server logs all requests in development mode. To see database queries, check `config/database.js`.

### 4. Adding New Features

1. Create controller in `controllers/`
2. Create routes in `routes/`
3. Add validation schemas in `middleware/validators.js`
4. Mount routes in `server.js`
5. Update API documentation

---

## Production Deployment Checklist

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Update `CORS_ORIGIN` to your frontend domain
- [ ] Set `NODE_ENV=production`
- [ ] Use environment variables for all sensitive data
- [ ] Change default user passwords
- [ ] Enable SSL/TLS for database connection
- [ ] Set up proper logging (Winston, Morgan)
- [ ] Implement rate limiting
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up automated backups for database
- [ ] Review and adjust pool size based on load
- [ ] Implement caching (Redis) for frequently accessed data

---

## Support

For issues or questions:

1. Check this guide and `API_DOCUMENTATION.md`
2. Review error messages carefully
3. Check database logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`
4. Check application logs in the terminal

---

## License

This project is for educational/commercial use.
