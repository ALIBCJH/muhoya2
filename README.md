# Garage Management System - Complete Implementation Guide

## 🚀 Project Overview

A full-stack Garage Management System with modern React frontend and PostgreSQL backend. Designed for automotive repair shops to manage fleet and individual customers, vehicles, service records, parts inventory, and invoicing.

---

## 📋 Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Getting Started](#getting-started)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [User Roles](#user-roles)
10. [Development Workflow](#development-workflow)
11. [Testing](#testing)
12. [Deployment](#deployment)

---

## ✨ Features

### Customer Management

- **Organizations (Fleet Customers)**: Manage corporate clients with multiple vehicles
- **Individual Clients**: Walk-in customers with personal vehicles
- Complete customer profiles with contact information

### Vehicle Management

- Comprehensive vehicle records (make, model, year, VIN, license plate)
- Vehicle ownership (organization or individual)
- Service history tracking per vehicle
- Search and filter capabilities

### Service Records

- Create service tickets with detailed descriptions
- Track service status (pending, in-progress, completed)
- Assign mechanics to services
- Parts usage tracking with automatic inventory deduction
- Labor cost management

### Parts Inventory

- Parts catalog with pricing
- Real-time stock tracking
- Low stock alerts
- Automatic stock updates when parts are used
- Part number and name search

### Invoicing & Billing

- Auto-generated invoice numbers (INV-YYYY-0001)
- Automatic calculation of:
  - Labor costs
  - Parts costs
  - Discounts
  - Taxes (VAT)
  - Total amount
- Payment tracking (unpaid, paid, partially paid)
- Multiple payment methods (cash, card, M-Pesa, bank transfer)
- Revenue statistics and reports

### User Management

- Role-based access control (Admin, Mechanic, Receptionist)
- JWT-based authentication
- Password encryption (bcrypt)
- User profiles

### UI/UX Features

- Modern, responsive design with Tailwind CSS
- Interactive charts and dashboards (Recharts)
- Toast notifications
- Loading states and skeletons
- Modal dialogs
- Data tables with sorting and pagination
- Search and filter functionality

---

## 🛠 Technology Stack

### Frontend

- **React 19.1.1** - UI framework
- **React Router 7.9.3** - Navigation
- **Tailwind CSS 3.4.17** - Styling
- **Recharts 3.2.1** - Data visualization
- **Vite 7.1.12** - Build tool

### Backend

- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **PostgreSQL** - Database
- **pg 8.11.3** - PostgreSQL client
- **JWT (jsonwebtoken 9.0.2)** - Authentication
- **bcrypt 6.0.0** - Password hashing
- **express-validator 7.0.1** - Input validation
- **dotenv 16.4.5** - Environment variables

### Development Tools

- **ESLint** - Code linting
- **nodemon** - Auto-reload server
- **PostCSS** - CSS processing

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│              (React + Tailwind CSS + Vite)              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │ REST API Calls
                     │ JWT Authentication
┌────────────────────▼────────────────────────────────────┐
│                  Express Server                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Routes Layer (API Endpoints)                   │   │
│  │  - Authentication, Organizations, Clients       │   │
│  │  - Vehicles, Parts, Services, Invoices          │   │
│  └──────────┬──────────────────────────────────────┘   │
│             │                                            │
│  ┌──────────▼──────────────────────────────────────┐   │
│  │  Middleware Layer                               │   │
│  │  - JWT Auth, Role Authorization                 │   │
│  │  - Input Validation, Error Handling             │   │
│  └──────────┬──────────────────────────────────────┘   │
│             │                                            │
│  ┌──────────▼──────────────────────────────────────┐   │
│  │  Controllers (Business Logic)                   │   │
│  │  - Data processing, validation                  │   │
│  │  - Transaction management                       │   │
│  └──────────┬──────────────────────────────────────┘   │
│             │                                            │
│  ┌──────────▼──────────────────────────────────────┐   │
│  │  Database Config (Connection Pool)              │   │
│  │  - 2-10 concurrent connections                  │   │
│  │  - Transaction support                          │   │
│  └──────────┬──────────────────────────────────────┘   │
└─────────────┼──────────────────────────────────────────┘
              │ SQL Queries
┌─────────────▼──────────────────────────────────────────┐
│                 PostgreSQL Database                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Tables (9): users, organizations, clients,     │   │
│  │  vehicles, parts, service_records,              │   │
│  │  service_parts, invoices, invoice_items         │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  Views (5): vehicles_with_owners,               │   │
│  │  service_records_detailed, invoices_detailed,   │   │
│  │  low_stock_parts, monthly_revenue               │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  Triggers (8): Auto-update timestamps           │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  Functions (1): Auto-generate invoice numbers   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18+): [Download](https://nodejs.org/)
2. **PostgreSQL** (v13+): [Download](https://www.postgresql.org/download/)
3. **Git**: [Download](https://git-scm.com/)
4. **Code Editor**: VS Code recommended

### Quick Setup (5 Minutes)

```bash
# 1. Navigate to project directory
cd Desktop/Muhoya

# 2. Install Frontend dependencies
cd Frontend
npm install

# 3. Install Backend dependencies
cd ../Backend
npm install

# 4. Create PostgreSQL database
psql -U postgres
CREATE DATABASE garage_db;
\q

# 5. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 6. Initialize database
npm run db:setup
npm run db:seed

# 7. Start Backend (Terminal 1)
npm run dev

# 8. Start Frontend (Terminal 2)
cd ../Frontend
npm run dev
```

**Access the application:**

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Docs: See `Backend/API_DOCUMENTATION.md`

---

## 🗄️ Backend Setup

### Step 1: Install Dependencies

```bash
cd Backend
npm install
```

### Step 2: Configure Environment

Create `.env` file:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=garage_db

# JWT
JWT_SECRET=your_secret_key_change_this
JWT_EXPIRATION=7d

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Security
BCRYPT_ROUNDS=10

# Pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

### Step 3: Initialize Database

```bash
# Create schema
npm run db:setup

# Add test data (optional)
npm run db:seed
```

### Step 4: Start Server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

**Test the server:**

```bash
curl http://localhost:3000/health
```

### Seeded Test Accounts

| Email                | Password      | Role         |
| -------------------- | ------------- | ------------ |
| admin@garage.com     | Admin@123     | admin        |
| mechanic@garage.com  | Mechanic@123  | mechanic     |
| reception@garage.com | Reception@123 | receptionist |

📖 **Full Documentation**: `Backend/BACKEND_SETUP.md`

---

## 🎨 Frontend Setup

### Step 1: Install Dependencies

```bash
cd Frontend
npm install
```

### Step 2: Configure API Endpoint

Edit `Frontend/src/Services/api.js`:

```javascript
const API_URL = "http://localhost:3000/api";
```

### Step 3: Start Development Server

```bash
npm run dev
```

Access at: http://localhost:5173

### Step 4: Login

Use one of the seeded accounts or create a new account via signup.

📖 **Full Documentation**: `Frontend/README.md`, `UI_ENHANCEMENT_GUIDE.md`

---

## 📊 Database Schema

### Core Tables

#### 1. users

Stores system users (admin, mechanic, receptionist)

```sql
- id, username, email, password_hash
- full_name, role
- created_at, updated_at
```

#### 2. organizations

Fleet customers (companies with multiple vehicles)

```sql
- id, name, contact_person
- email, phone, address
- created_at, updated_at
```

#### 3. clients

Individual customers (walk-ins)

```sql
- id, full_name, email, phone
- address, created_at, updated_at
```

#### 4. vehicles

Cars/trucks with single owner (org XOR client)

```sql
- id, license_plate, make, model
- year, color, vin
- organization_id, client_id
- created_at, updated_at
- CHECK: (org_id IS NULL) != (client_id IS NULL)
```

#### 5. parts

Spare parts inventory

```sql
- id, part_name, part_number
- price, quantity_in_stock, reorder_level
- created_at, updated_at
```

#### 6. service_records

Service/repair tickets

```sql
- id, vehicle_id, mechanic_id
- description, service_date
- labor_cost, status (pending/in_progress/completed)
- created_at, updated_at
```

#### 7. service_parts

Junction table (many-to-many)

```sql
- id, service_record_id, part_id
- quantity
```

#### 8. invoices

Billing documents with auto-generated numbers

```sql
- id, invoice_number (INV-YYYY-0001)
- service_record_id, issue_date
- subtotal, discount, tax_rate, tax_amount
- total_amount, payment_status, payment_method
- payment_date, created_at, updated_at
```

#### 9. invoice_items

Line items on invoices

```sql
- id, invoice_id, part_id
- quantity, unit_price, total_price
```

### Views

1. **vehicles_with_owners** - Vehicles with owner names
2. **service_records_detailed** - Services with all related data
3. **invoices_detailed** - Full invoice information
4. **low_stock_parts** - Parts below reorder level
5. **monthly_revenue** - Revenue by month/year

### Triggers

8 triggers for auto-updating `updated_at` timestamps on all tables.

### Functions

**generate_invoice_number()** - Creates sequential invoice numbers per year

📖 **Schema File**: `Backend/database/schema.sql`

---

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user
- `PUT /api/auth/password` - Update password

### Organizations

- `GET /api/organizations` - List (paginated)
- `GET /api/organizations/:id` - Get one
- `POST /api/organizations` - Create
- `PUT /api/organizations/:id` - Update
- `DELETE /api/organizations/:id` - Delete
- `GET /api/organizations/:id/vehicles` - Org vehicles

### Clients

- `GET /api/clients` - List (paginated)
- `GET /api/clients/:id` - Get one
- `POST /api/clients` - Create
- `PUT /api/clients/:id` - Update
- `DELETE /api/clients/:id` - Delete
- `GET /api/clients/:id/vehicles` - Client vehicles
- `GET /api/clients/:id/services` - Service history

### Vehicles

- `GET /api/vehicles` - List (paginated, filterable)
- `GET /api/vehicles/:id` - Get one
- `POST /api/vehicles` - Create
- `PUT /api/vehicles/:id` - Update
- `DELETE /api/vehicles/:id` - Delete
- `GET /api/vehicles/:id/services` - Service history

### Parts

- `GET /api/parts` - List (paginated)
- `GET /api/parts/:id` - Get one
- `POST /api/parts` - Create
- `PUT /api/parts/:id` - Update
- `DELETE /api/parts/:id` - Delete
- `GET /api/parts/alerts/low-stock` - Low stock alerts
- `PATCH /api/parts/:id/stock` - Update stock

### Services

- `GET /api/services` - List (paginated, filterable)
- `GET /api/services/:id` - Get one
- `POST /api/services` - Create
- `PUT /api/services/:id` - Update
- `DELETE /api/services/:id` - Delete
- `POST /api/services/:id/parts` - Add part

### Invoices

- `GET /api/invoices` - List (paginated, filterable)
- `GET /api/invoices/:id` - Get one
- `POST /api/invoices` - Create
- `PUT /api/invoices/:id` - Update
- `DELETE /api/invoices/:id` - Delete
- `PATCH /api/invoices/:id/pay` - Mark as paid
- `GET /api/invoices/stats/revenue` - Revenue stats

📖 **Full API Docs**: `Backend/API_DOCUMENTATION.md`

---

## 👥 User Roles

### Admin

- **Full access** to all features
- Can delete any record
- View revenue statistics
- Manage users
- Access all endpoints

### Mechanic

- Create and update service records
- Add parts to services
- Manage parts inventory
- View vehicles and customers
- **Cannot** delete records or manage billing

### Receptionist

- Manage customers (organizations and clients)
- Manage vehicles
- Create and manage invoices
- Mark payments
- **Cannot** delete records or manage inventory

---

## 💻 Development Workflow

### Frontend Development

```bash
cd Frontend
npm run dev
```

**File Structure:**

- `src/components/` - React components
- `src/components/ui/` - Reusable UI components (Button, Card, Input, etc.)
- `src/Pages/` - Page components
- `src/Services/` - API integration
- `src/auth/` - Authentication context
- `src/hooks/` - Custom React hooks

**Making Changes:**

1. Create/edit component in appropriate folder
2. Import and use in parent component
3. Hot reload will update instantly
4. Check browser console for errors

### Backend Development

```bash
cd Backend
npm run dev  # nodemon auto-reloads on changes
```

**Adding New Endpoints:**

1. Create controller function in `controllers/`
2. Add validation schema in `middleware/validators.js`
3. Create route in `routes/`
4. Mount route in `server.js`
5. Update API documentation

**Database Changes:**

1. Modify `database/schema.sql`
2. Run `npm run db:setup` (drops and recreates)
3. Run `npm run db:seed` for test data

---

## 🧪 Testing

### Manual API Testing

Using cURL:

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@garage.com","password":"Admin@123"}' \
  | jq -r '.data.token')

# Get vehicles
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/vehicles | jq

# Create client
curl -X POST http://localhost:3000/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "full_name": "Test User",
    "phone": "+254700000000",
    "email": "test@email.com"
  }' | jq
```

### Using Postman

1. Import collection: Create new requests for each endpoint
2. Set environment variable: `{{baseUrl}}` = `http://localhost:3000/api`
3. Add Authorization header: `Bearer {{token}}`
4. Test CRUD operations

### Frontend Testing

1. Login with test account
2. Create a client/organization
3. Add a vehicle
4. Create a service record
5. Add parts to service
6. Complete service
7. Generate invoice
8. Mark invoice as paid

---

## 🚢 Deployment

### Backend Deployment (Production)

#### Prepare for Production

1. **Update `.env` for production:**

```env
NODE_ENV=production
DB_HOST=production-db-host
JWT_SECRET=strong_random_secret_change_this
CORS_ORIGIN=https://yourdomain.com
```

2. **Security Checklist:**

- [ ] Change JWT_SECRET
- [ ] Update database credentials
- [ ] Enable SSL for database
- [ ] Change default user passwords
- [ ] Set up rate limiting
- [ ] Enable HTTPS

#### Deploy Options

**Option 1: VPS (DigitalOcean, Linode, AWS EC2)**

```bash
# On server
git clone your-repo
cd Backend
npm install --production
npm run db:setup
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name garage-backend
pm2 save
pm2 startup
```

**Option 2: Heroku**

```bash
# Add Heroku Postgres addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

**Option 3: Docker**

Create `Dockerfile`:

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Frontend Deployment

**Build for Production:**

```bash
cd Frontend
npm run build
# Outputs to dist/
```

**Deploy Options:**

- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop `dist/` folder
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket
- **Nginx**: Serve `dist/` folder

---

## 📁 Project Structure

```
Muhoya/
├── Frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/           # Reusable UI components
│   │   │   ├── *Enhanced.jsx # Modern page components
│   │   ├── Pages/            # Route pages
│   │   ├── Services/         # API integration
│   │   ├── auth/             # Auth context
│   │   ├── hooks/            # Custom hooks
│   │   └── assets/           # Images, icons
│   ├── public/               # Static assets
│   ├── index.html            # HTML template
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.js        # Vite configuration
│   └── tailwind.config.js    # Tailwind configuration
├── Backend/
│   ├── config/               # Configuration files
│   │   └── database.js       # PostgreSQL connection pool
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── clientsController.js
│   │   ├── invoicesController.js
│   │   ├── organizationsController.js
│   │   ├── partsController.js
│   │   ├── servicesController.js
│   │   └── vehiclesController.js
│   ├── database/             # Database files
│   │   ├── schema.sql        # Database schema
│   │   └── seed.sql          # Sample data
│   ├── middleware/           # Express middleware
│   │   ├── auth.js           # JWT authentication
│   │   ├── errorHandler.js   # Error handling
│   │   ├── validate.js       # Validation middleware
│   │   └── validators.js     # Validation schemas
│   ├── routes/               # API routes
│   │   ├── auth.routes.js
│   │   ├── clients.routes.js
│   │   ├── invoices.routes.js
│   │   ├── organizations.routes.js
│   │   ├── parts.routes.js
│   │   ├── services.routes.js
│   │   └── vehicles.routes.js
│   ├── utils/                # Utility functions
│   │   └── helpers.js
│   ├── .env.example          # Environment template
│   ├── server.js             # Express app entry point
│   ├── package.json          # Backend dependencies
│   ├── API_DOCUMENTATION.md  # Complete API docs
│   └── BACKEND_SETUP.md      # Setup instructions
├── UI_ENHANCEMENT_GUIDE.md   # Frontend UI guide
├── QUICK_START.md            # Quick start guide
└── SUMMARY.md                # Project summary
```

---

## 🎯 Key Features Implemented

### ✅ Backend

- [x] PostgreSQL database with 9 tables, 5 views
- [x] JWT authentication with role-based access
- [x] Complete CRUD APIs for all entities
- [x] Input validation with express-validator
- [x] Transaction support for complex operations
- [x] Auto-generated invoice numbers
- [x] Automatic stock management
- [x] Pagination on all list endpoints
- [x] Search and filter capabilities
- [x] Error handling with proper status codes
- [x] Connection pooling (2-10 connections)

### ✅ Frontend

- [x] Modern UI with Tailwind CSS
- [x] 9 reusable UI components
- [x] 6 enhanced page components
- [x] Toast notification system
- [x] Loading states and skeletons
- [x] Responsive design (mobile, tablet, desktop)
- [x] Interactive charts (Recharts)
- [x] Form validation
- [x] Modal dialogs
- [x] Data tables with sorting

---

## 🐛 Troubleshooting

### Backend Issues

**Error: "relation does not exist"**

```bash
npm run db:setup
```

**Error: "Connection refused"**

```bash
sudo systemctl start postgresql
# Verify credentials in .env
```

**Error: "Port 3000 already in use"**

```bash
lsof -ti:3000 | xargs kill -9
# Or change PORT in .env
```

### Frontend Issues

**Error: "Network Error" or "CORS error"**

- Check backend is running on port 3000
- Verify `CORS_ORIGIN` in backend `.env`
- Check API_URL in `src/Services/api.js`

**Build errors:**

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Documentation Files

1. **README.md** (this file) - Complete project overview
2. **Backend/BACKEND_SETUP.md** - Backend setup guide
3. **Backend/API_DOCUMENTATION.md** - Complete API reference
4. **UI_ENHANCEMENT_GUIDE.md** - Frontend UI components guide
5. **QUICK_START.md** - Quick start guide
6. **SUMMARY.md** - Project summary

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation
5. Submit pull request

---

## 📝 License

This project is licensed for educational and commercial use.

---

## 🎉 Success!

Your Garage Management System is now ready!

**Next Steps:**

1. Review the documentation files
2. Test all features with seeded data
3. Customize for your specific needs
4. Deploy to production

**Need Help?**

- Check documentation files
- Review error messages carefully
- Test with cURL or Postman
- Check browser/server console logs

Happy coding! 🚀
