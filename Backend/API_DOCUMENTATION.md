# Backend API Documentation

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Organizations](#organizations)
4. [Clients](#clients)
5. [Vehicles](#vehicles)
6. [Parts](#parts)
7. [Service Records](#service-records)
8. [Invoices](#invoices)
9. [Error Handling](#error-handling)

---

## Getting Started

### Base URL

```
http://localhost:3000/api
```

### Authentication

Most endpoints require a JWT token. Include it in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

### Response Format

All responses follow this format:

```json
{
  "success": true|false,
  "message": "Description of the result",
  "data": { ... }
}
```

### Pagination

List endpoints support pagination with query parameters:

- `page` (default: 1)
- `limit` (default: 20, max: 100)

Example: `GET /api/vehicles?page=2&limit=50`

---

## Authentication

### 1. Sign Up

**POST** `/api/auth/signup`

Create a new user account.

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "role": "receptionist"
}
```

**Roles:** `admin`, `mechanic`, `receptionist`

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "receptionist",
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

**POST** `/api/auth/login`

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Current User

**GET** `/api/auth/me`

Requires authentication.

**Response (200):**

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "receptionist",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### 4. Update Password

**PUT** `/api/auth/password`

**Request Body:**

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass456"
}
```

---

## Organizations

### 1. Get All Organizations

**GET** `/api/organizations`

**Query Parameters:**

- `page` (number)
- `limit` (number)
- `search` (string) - Search by name or contact person

**Example:** `GET /api/organizations?search=kenya&page=1&limit=20`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Kenya Power",
      "contact_person": "Jane Smith",
      "email": "fleet@kenyapower.co.ke",
      "phone": "+254701234567",
      "address": "Nairobi, Kenya",
      "created_at": "2024-01-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. Get Single Organization

**GET** `/api/organizations/:id`

**Response (200):**

```json
{
  "success": true,
  "message": "Organization retrieved successfully",
  "data": {
    "organization": {
      "id": 1,
      "name": "Kenya Power",
      "contact_person": "Jane Smith",
      "email": "fleet@kenyapower.co.ke",
      "phone": "+254701234567",
      "address": "Nairobi, Kenya",
      "created_at": "2024-01-10T08:00:00.000Z",
      "updated_at": "2024-01-10T08:00:00.000Z"
    }
  }
}
```

### 3. Create Organization

**POST** `/api/organizations`

**Requires:** Admin or Receptionist role

**Request Body:**

```json
{
  "name": "Safaricom PLC",
  "contact_person": "James Kamau",
  "email": "fleet@safaricom.co.ke",
  "phone": "+254722000000",
  "address": "Westlands, Nairobi"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Organization created successfully",
  "data": {
    "organization": { ... }
  }
}
```

### 4. Update Organization

**PUT** `/api/organizations/:id`

**Requires:** Admin or Receptionist role

**Request Body:** (all fields optional)

```json
{
  "name": "Safaricom Limited",
  "contact_person": "John Doe",
  "email": "newfleet@safaricom.co.ke",
  "phone": "+254722111111",
  "address": "New Location, Nairobi"
}
```

### 5. Delete Organization

**DELETE** `/api/organizations/:id`

**Requires:** Admin role

**Response (200):**

```json
{
  "success": true,
  "message": "Organization deleted successfully"
}
```

### 6. Get Organization Vehicles

**GET** `/api/organizations/:id/vehicles`

Get all vehicles belonging to an organization.

**Response:** Paginated list of vehicles

---

## Clients

### 1. Get All Clients

**GET** `/api/clients`

**Query Parameters:**

- `page`, `limit`
- `search` - Search by name, phone, or email

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "full_name": "Alice Wanjiru",
      "email": "alice@email.com",
      "phone": "+254712345678",
      "address": "Karen, Nairobi",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### 2. Get Single Client

**GET** `/api/clients/:id`

### 3. Create Client

**POST** `/api/clients`

**Requires:** Admin or Receptionist role

**Request Body:**

```json
{
  "full_name": "Peter Mwangi",
  "email": "peter@email.com",
  "phone": "+254723456789",
  "address": "Kileleshwa, Nairobi"
}
```

### 4. Update Client

**PUT** `/api/clients/:id`

**Requires:** Admin or Receptionist role

### 5. Delete Client

**DELETE** `/api/clients/:id`

**Requires:** Admin role

### 6. Get Client Vehicles

**GET** `/api/clients/:id/vehicles`

### 7. Get Client Service History

**GET** `/api/clients/:id/services`

---

## Vehicles

### 1. Get All Vehicles

**GET** `/api/vehicles`

**Query Parameters:**

- `page`, `limit`
- `search` - Search by license plate, make, or model
- `organization_id` - Filter by organization
- `client_id` - Filter by client

**Example:** `GET /api/vehicles?search=toyota&organization_id=1`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "license_plate": "KDA 123A",
      "make": "Toyota",
      "model": "Hilux",
      "year": 2022,
      "color": "White",
      "vin": "5TDJK3DC8NS123456",
      "organization_id": 1,
      "client_id": null,
      "organization_name": "Kenya Power",
      "client_name": null,
      "created_at": "2024-01-10T09:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### 2. Get Single Vehicle

**GET** `/api/vehicles/:id`

### 3. Create Vehicle

**POST** `/api/vehicles`

**Requires:** Admin or Receptionist role

**Request Body:**

```json
{
  "license_plate": "KDB 456B",
  "make": "Nissan",
  "model": "Patrol",
  "year": 2021,
  "color": "Silver",
  "vin": "1N4BL4BV7LC123456",
  "organization_id": 2,
  "client_id": null
}
```

**Note:** Either `organization_id` OR `client_id` must be provided, not both.

### 4. Update Vehicle

**PUT** `/api/vehicles/:id`

**Requires:** Admin or Receptionist role

**Request Body:** (all fields optional)

```json
{
  "license_plate": "KDB 456C",
  "make": "Nissan",
  "model": "Patrol",
  "year": 2021,
  "color": "Blue"
}
```

### 5. Delete Vehicle

**DELETE** `/api/vehicles/:id`

**Requires:** Admin role

### 6. Get Vehicle Service History

**GET** `/api/vehicles/:id/services`

Get all service records for a specific vehicle.

---

## Parts

### 1. Get All Parts

**GET** `/api/parts`

**Query Parameters:**

- `page`, `limit`
- `search` - Search by part name or number
- `low_stock` - Filter low stock parts (`true`/`false`)

**Example:** `GET /api/parts?low_stock=true`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "part_name": "Engine Oil Filter",
      "part_number": "OF-001",
      "price": 1500.00,
      "quantity_in_stock": 25,
      "reorder_level": 10,
      "created_at": "2024-01-05T12:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### 2. Get Single Part

**GET** `/api/parts/:id`

### 3. Create Part

**POST** `/api/parts`

**Requires:** Admin or Mechanic role

**Request Body:**

```json
{
  "part_name": "Brake Pads",
  "part_number": "BP-100",
  "price": 3500.0,
  "quantity_in_stock": 50,
  "reorder_level": 15
}
```

### 4. Update Part

**PUT** `/api/parts/:id`

**Requires:** Admin or Mechanic role

### 5. Delete Part

**DELETE** `/api/parts/:id`

**Requires:** Admin role

### 6. Get Low Stock Parts

**GET** `/api/parts/alerts/low-stock`

Get all parts below their reorder level.

**Response (200):**

```json
{
  "success": true,
  "message": "Low stock parts retrieved successfully",
  "data": {
    "parts": [ ... ],
    "count": 5
  }
}
```

### 7. Update Part Stock

**PATCH** `/api/parts/:id/stock`

**Requires:** Admin or Mechanic role

**Request Body:**

```json
{
  "quantity": 20,
  "operation": "add"
}
```

**Operations:** `add` or `subtract`

---

## Service Records

### 1. Get All Service Records

**GET** `/api/services`

**Query Parameters:**

- `page`, `limit`
- `search` - Search by description or license plate
- `status` - Filter by status (`pending`, `in_progress`, `completed`)
- `vehicle_id` - Filter by vehicle
- `mechanic_id` - Filter by mechanic

**Example:** `GET /api/services?status=in_progress`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "vehicle_id": 1,
      "mechanic_id": 2,
      "description": "Oil change and tire rotation",
      "service_date": "2024-01-20T10:00:00.000Z",
      "labor_cost": 5000.00,
      "status": "completed",
      "license_plate": "KDA 123A",
      "make": "Toyota",
      "model": "Hilux",
      "mechanic_name": "Mike Omondi",
      "created_at": "2024-01-20T09:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### 2. Get Single Service Record

**GET** `/api/services/:id`

**Response (200):**

```json
{
  "success": true,
  "message": "Service record retrieved successfully",
  "data": {
    "service": {
      "id": 1,
      "vehicle_id": 1,
      "mechanic_id": 2,
      "description": "Oil change and tire rotation",
      "service_date": "2024-01-20T10:00:00.000Z",
      "labor_cost": 5000.0,
      "status": "completed",
      "license_plate": "KDA 123A",
      "make": "Toyota",
      "model": "Hilux",
      "year": 2022,
      "mechanic_name": "Mike Omondi",
      "organization_name": "Kenya Power",
      "client_name": null,
      "parts": [
        {
          "id": 1,
          "part_id": 1,
          "quantity": 1,
          "part_name": "Engine Oil Filter",
          "part_number": "OF-001",
          "price": 1500.0
        }
      ]
    }
  }
}
```

### 3. Create Service Record

**POST** `/api/services`

**Requires:** Authentication (any role)

**Request Body:**

```json
{
  "vehicle_id": 1,
  "description": "Full service - oil change, filter replacement, brake inspection",
  "labor_cost": 8000.0,
  "status": "pending",
  "parts": [
    {
      "part_id": 1,
      "quantity": 1
    },
    {
      "part_id": 5,
      "quantity": 4
    }
  ]
}
```

**Note:** Parts are automatically deducted from inventory.

### 4. Update Service Record

**PUT** `/api/services/:id`

**Requires:** Admin or Mechanic role

**Request Body:** (all fields optional)

```json
{
  "description": "Updated description",
  "labor_cost": 9000.0,
  "status": "completed",
  "mechanic_id": 2
}
```

### 5. Delete Service Record

**DELETE** `/api/services/:id`

**Requires:** Admin role

**Note:** Parts are returned to inventory.

### 6. Add Part to Service

**POST** `/api/services/:id/parts`

**Requires:** Admin or Mechanic role

**Request Body:**

```json
{
  "part_id": 3,
  "quantity": 2
}
```

---

## Invoices

### 1. Get All Invoices

**GET** `/api/invoices`

**Query Parameters:**

- `page`, `limit`
- `search` - Search by invoice number or license plate
- `payment_status` - Filter by status (`unpaid`, `paid`, `partially_paid`)
- `start_date` - Filter by issue date (YYYY-MM-DD)
- `end_date` - Filter by issue date (YYYY-MM-DD)

**Example:** `GET /api/invoices?payment_status=unpaid&start_date=2024-01-01`

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "invoice_number": "INV-2024-0001",
      "service_record_id": 1,
      "issue_date": "2024-01-20T12:00:00.000Z",
      "subtotal": 8500.00,
      "discount": 5.00,
      "tax_rate": 16.00,
      "tax_amount": 1292.00,
      "total_amount": 9367.00,
      "payment_status": "paid",
      "payment_method": "mpesa",
      "payment_date": "2024-01-21T10:00:00.000Z",
      "license_plate": "KDA 123A",
      "make": "Toyota",
      "model": "Hilux",
      "customer_name": "Kenya Power"
    }
  ],
  "pagination": { ... }
}
```

### 2. Get Single Invoice

**GET** `/api/invoices/:id`

**Response (200):**

```json
{
  "success": true,
  "message": "Invoice retrieved successfully",
  "data": {
    "invoice": {
      "id": 1,
      "invoice_number": "INV-2024-0001",
      "service_record_id": 1,
      "issue_date": "2024-01-20T12:00:00.000Z",
      "subtotal": 8500.0,
      "discount": 5.0,
      "tax_rate": 16.0,
      "tax_amount": 1292.0,
      "total_amount": 9367.0,
      "payment_status": "paid",
      "payment_method": "mpesa",
      "payment_date": "2024-01-21T10:00:00.000Z",
      "service_description": "Full service",
      "labor_cost": 7000.0,
      "service_date": "2024-01-20T10:00:00.000Z",
      "license_plate": "KDA 123A",
      "make": "Toyota",
      "model": "Hilux",
      "year": 2022,
      "vin": "5TDJK3DC8NS123456",
      "organization_name": "Kenya Power",
      "client_name": null,
      "mechanic_name": "Mike Omondi",
      "items": [
        {
          "id": 1,
          "part_id": 1,
          "quantity": 1,
          "unit_price": 1500.0,
          "total_price": 1500.0,
          "part_name": "Engine Oil Filter",
          "part_number": "OF-001"
        }
      ]
    }
  }
}
```

### 3. Create Invoice

**POST** `/api/invoices`

**Requires:** Admin or Receptionist role

**Request Body:**

```json
{
  "service_record_id": 1,
  "discount": 10,
  "tax_rate": 16,
  "payment_method": "mpesa"
}
```

**Note:**

- Invoice number is auto-generated
- Subtotal is calculated from service labor and parts
- Can only create invoice for completed service records

### 4. Update Invoice

**PUT** `/api/invoices/:id`

**Requires:** Admin or Receptionist role

**Request Body:** (all fields optional)

```json
{
  "payment_status": "paid",
  "payment_method": "cash",
  "discount": 15,
  "tax_rate": 16
}
```

### 5. Delete Invoice

**DELETE** `/api/invoices/:id`

**Requires:** Admin role

### 6. Mark Invoice as Paid

**PATCH** `/api/invoices/:id/pay`

**Requires:** Admin or Receptionist role

**Request Body:**

```json
{
  "payment_method": "cash"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Invoice marked as paid successfully",
  "data": {
    "invoice": { ... }
  }
}
```

### 7. Get Revenue Statistics

**GET** `/api/invoices/stats/revenue`

**Requires:** Admin role

**Query Parameters:**

- `year` (default: current year)
- `month` (optional)

**Example:** `GET /api/invoices/stats/revenue?year=2024&month=1`

**Response (200):**

```json
{
  "success": true,
  "message": "Revenue statistics retrieved successfully",
  "data": {
    "revenue": [
      {
        "year": 2024,
        "month": 1,
        "month_name": "January",
        "total_revenue": 450000.0,
        "paid_invoices": 15,
        "unpaid_invoices": 3
      }
    ]
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description"
}
```

### Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

### Common HTTP Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (missing or invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **409** - Conflict (duplicate entry)
- **500** - Internal Server Error

---

## Rate Limiting & Best Practices

1. **Pagination**: Always use pagination for list endpoints to avoid performance issues
2. **Search**: Use the search parameter instead of fetching all records and filtering client-side
3. **Filtering**: Combine filters to reduce data transfer (e.g., `?status=pending&vehicle_id=5`)
4. **Token Expiration**: Tokens expire after 7 days. Handle 401 errors by redirecting to login
5. **Error Handling**: Always check the `success` field before processing data

---

## Example Integration (JavaScript)

```javascript
// Login and get token
const login = async (email, password) => {
  const response = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem("token", data.data.token);
    return data.data.user;
  }
  throw new Error(data.message);
};

// Fetch vehicles with authentication
const getVehicles = async (page = 1, search = "") => {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `http://localhost:3000/api/vehicles?page=${page}&search=${search}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  if (data.success) {
    return data;
  }
  throw new Error(data.message);
};

// Create a new service record
const createService = async (serviceData) => {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3000/api/services", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(serviceData),
  });

  const data = await response.json();
  if (data.success) {
    return data.data.service;
  }
  throw new Error(data.message);
};
```

---

## Support & Troubleshooting

### Common Issues

**1. "Access token required" error**

- Make sure you're including the Authorization header
- Check that the token format is: `Bearer <token>`

**2. "Invalid or expired token" error**

- Token has expired (7 days). User needs to log in again
- Token was not generated correctly

**3. "Access denied. Insufficient permissions" error**

- User role doesn't have permission for this endpoint
- Check the role requirements in the endpoint documentation

**4. Validation errors**

- Check the `errors` array in the response
- Ensure all required fields are provided
- Verify data types and formats (e.g., email format, phone format)

**5. "Cannot delete X with existing Y" errors**

- Related records exist. Delete or reassign them first
- Example: Can't delete a vehicle that has service records
