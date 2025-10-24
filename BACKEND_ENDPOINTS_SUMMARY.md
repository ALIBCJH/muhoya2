# Backend API Endpoints Summary

## Overview

All endpoints are protected with JWT authentication. Base URL: `http://localhost:3000/api`

---

## 🔐 Authentication Endpoints

### POST /api/auth/signup

**Access:** Public  
**Request Body:**

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "fullname": "John Doe",
      "email": "john@example.com",
      "role": "receptionist"
    }
  }
}
```

### POST /api/auth/login

**Access:** Public  
**Request Body:**

```json
{
  "email": "admin@muhoya.com",
  "password": "Admin@1234"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "fullname": "Admin User",
      "email": "admin@muhoya.com",
      "role": "admin"
    }
  }
}
```

---

## 👤 Clients Endpoints

### GET /api/clients

**Access:** Private (All authenticated users)  
**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name, phone, or email

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+254700123456",
      "address": "Nairobi",
      "created_at": "2025-01-20T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### POST /api/clients/with-vehicles

**Access:** Private (Admin, Receptionist)  
**Description:** Create a walk-in client with their vehicles in one transaction  
**Request Body:**

```json
{
  "clientName": "John Doe",
  "phone": "+254700123456",
  "email": "john@example.com",
  "vehicles": [
    {
      "vehicleType": "SUV",
      "makeModel": "Toyota Landcruiser",
      "regNo": "KCA 123A"
    },
    {
      "vehicleType": "Sedan",
      "makeModel": "Honda Civic",
      "regNo": "KCB 456B"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Client and vehicles created successfully",
  "data": {
    "client": {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+254700123456",
      "address": null,
      "created_at": "2025-01-20T10:30:00Z"
    },
    "vehicles": [
      {
        "id": 1,
        "license_plate": "KCA 123A",
        "make": "Toyota",
        "model": "Landcruiser",
        "year": 2025,
        "color": "SUV",
        "client_id": 1,
        "created_at": "2025-01-20T10:30:00Z"
      }
    ]
  }
}
```

### GET /api/clients/:id

**Access:** Private  
**Response:** Single client details

### PUT /api/clients/:id

**Access:** Private (Admin, Receptionist)  
**Request Body:**

```json
{
  "full_name": "John Updated",
  "email": "john.updated@example.com",
  "phone": "+254700999888",
  "address": "Updated Address"
}
```

### DELETE /api/clients/:id

**Access:** Private (Admin only)  
**Note:** Cannot delete clients with existing vehicles

### GET /api/clients/:id/vehicles

**Access:** Private  
**Description:** Get all vehicles owned by a client  
**Query Parameters:** `page`, `limit`

### GET /api/clients/:id/services

**Access:** Private  
**Description:** Get service history for all client vehicles  
**Query Parameters:** `page`, `limit`

---

## 🏢 Organizations Endpoints

### GET /api/organizations

**Access:** Private (All authenticated users)  
**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by name or contact person

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "ABC Transport Ltd",
      "contact_person": "John Manager",
      "email": "info@abctransport.com",
      "phone": "+254700111222",
      "address": "Nairobi, Kenya",
      "created_at": "2025-01-15T08:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

### POST /api/organizations

**Access:** Private (Admin, Receptionist)  
**Request Body:**

```json
{
  "name": "XYZ Logistics Ltd",
  "contact_person": "Jane Director",
  "email": "contact@xyzlogistics.com",
  "phone": "+254700333444",
  "address": "Mombasa, Kenya"
}
```

### GET /api/organizations/:id

**Access:** Private  
**Response:** Single organization details

### PUT /api/organizations/:id

**Access:** Private (Admin, Receptionist)  
**Request Body:** Same fields as POST

### DELETE /api/organizations/:id

**Access:** Private (Admin only)  
**Note:** Cannot delete organizations with existing vehicles

### GET /api/organizations/:id/vehicles

**Access:** Private  
**Description:** Get all vehicles owned by an organization  
**Query Parameters:** `page`, `limit`

---

## 🚗 Vehicles Endpoints

### GET /api/vehicles

**Access:** Private  
**Query Parameters:** `page`, `limit`, `search` (license plate, make, model)

### POST /api/vehicles

**Access:** Private (Admin, Receptionist)  
**Request Body:**

```json
{
  "license_plate": "KCA 123A",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "color": "White",
  "client_id": 1,
  "organization_id": null
}
```

**Note:** Either `client_id` OR `organization_id` must be provided, not both

### GET /api/vehicles/:id

**Access:** Private

### PUT /api/vehicles/:id

**Access:** Private (Admin, Receptionist)

### DELETE /api/vehicles/:id

**Access:** Private (Admin only)

---

## 🔧 Services Endpoints

### GET /api/services

**Access:** Private  
**Description:** Get all service records

### POST /api/services

**Access:** Private (Admin, Mechanic)  
**Request Body:**

```json
{
  "vehicle_id": 1,
  "service_type": "Oil Change",
  "description": "Full synthetic oil change",
  "service_date": "2025-01-20",
  "labor_cost": 2000,
  "total_cost": 5000,
  "status": "completed",
  "mechanic_notes": "No issues found"
}
```

### GET /api/services/:id

**Access:** Private

### PUT /api/services/:id

**Access:** Private (Admin, Mechanic)

### DELETE /api/services/:id

**Access:** Private (Admin only)

---

## 📦 Parts Endpoints

### GET /api/parts

**Access:** Private  
**Description:** Get all parts inventory

### POST /api/parts

**Access:** Private (Admin)  
**Request Body:**

```json
{
  "part_name": "Oil Filter",
  "part_number": "OF-123",
  "quantity_in_stock": 50,
  "unit_price": 500,
  "supplier": "AutoParts Kenya"
}
```

### GET /api/parts/:id

**Access:** Private

### PUT /api/parts/:id

**Access:** Private (Admin)

### DELETE /api/parts/:id

**Access:** Private (Admin only)

---

## 📄 Invoices Endpoints

### GET /api/invoices

**Access:** Private  
**Description:** Get all invoices

### POST /api/invoices

**Access:** Private (Admin, Receptionist)  
**Request Body:**

```json
{
  "service_record_id": 1,
  "client_id": 1,
  "invoice_date": "2025-01-20",
  "total_amount": 5000,
  "tax_amount": 800,
  "discount_amount": 0,
  "payment_status": "paid",
  "payment_method": "mpesa"
}
```

### GET /api/invoices/:id

**Access:** Private

### PUT /api/invoices/:id

**Access:** Private (Admin, Receptionist)

### DELETE /api/invoices/:id

**Access:** Private (Admin only)

---

## 🔒 Authorization Levels

- **Public:** No authentication required
- **Private (All):** Any authenticated user
- **Private (Admin, Receptionist):** Admin or Receptionist roles
- **Private (Admin, Mechanic):** Admin or Mechanic roles
- **Private (Admin only):** Admin role only

---

## 📋 Notes

1. All authenticated requests require `Authorization: Bearer <token>` header
2. All responses follow the format:
   ```json
   {
     "success": true/false,
     "message": "descriptive message",
     "data": {}
   }
   ```
3. Error responses include:
   ```json
   {
     "success": false,
     "message": "Error description",
     "errors": [] // Optional validation errors array
   }
   ```
4. The `createWithVehicles` endpoint handles transactions automatically
5. Pagination is available on all list endpoints
6. Search functionality is case-insensitive (ILIKE)

---

## ✅ Frontend Integration Status

### Completed:

- ✅ Authentication (Login/Signup)
- ✅ Clients listing (GET /api/clients)
- ✅ Client creation with vehicles (POST /api/clients/with-vehicles)
- ✅ Organizations listing (GET /api/organizations)
- ✅ Organization creation (POST /api/organizations)

### Dummy Data Removed:

- ✅ ClientPageEnhanced - No sample data fallback
- ✅ OrganizationPageEnhanced - No sample data fallback

### Needs Integration:

- Dashboard stats (needs dedicated endpoints)
- Vehicle management UI
- Service records UI
- Parts inventory UI
- Invoice management UI
