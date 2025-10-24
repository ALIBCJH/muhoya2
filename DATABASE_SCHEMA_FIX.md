# Database Schema Fix - Column Name Alignment

## Issue: Column "license_plate" does not exist

### Root Cause:

The actual database schema uses different column names than what the controllers were expecting:

**Actual Schema:**

- `registration_number` (not `license_plate`)
- `make_model` (single column, not separate `make` and `model`)
- `vehicle_type` (not `color`)

**What Controllers Were Using:**

- `license_plate`
- `make` and `model` (separate columns)
- `color`

---

## Files Fixed:

### 1. `/Backend/controllers/clientsController.js`

#### Function: `createClientWithVehicles()`

**Before:**

```javascript
INSERT INTO vehicles (license_plate, make, model, year, color, client_id)
VALUES ($1, $2, $3, $4, $5, $6)
```

**After:**

```javascript
INSERT INTO vehicles (registration_number, make_model, vehicle_type, year, client_id)
VALUES ($1, $2, $3, $4, $5)
```

**Changes:**

- `license_plate` → `registration_number`
- `make, model` (split) → `make_model` (single column)
- `color` → `vehicle_type`
- Removed splitting of makeModel into separate make/model parts
- Use makeModel directly from frontend

#### Function: `getClientServices()`

**Before:**

```sql
SELECT sr.*, v.license_plate, v.make, v.model
```

**After:**

```sql
SELECT sr.*, v.registration_number, v.make_model
```

---

### 2. `/Backend/controllers/organizationsController.js`

#### Function: `createOrganizationWithVehicles()`

**Before:**

```javascript
INSERT INTO vehicles (license_plate, make, model, year, color, organization_id)
VALUES ($1, $2, $3, $4, $5, $6)
```

**After:**

```javascript
INSERT INTO vehicles (registration_number, make_model, vehicle_type, year, organization_id)
VALUES ($1, $2, $3, $4, $5)
```

**Changes:**

- Same as clientsController
- Removed unnecessary make/model splitting
- Uses `registration_number` instead of `license_plate`

---

## Actual Database Schema (vehicles table):

```sql
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL UNIQUE,  -- Not license_plate
    make_model VARCHAR(100) NOT NULL,                 -- Single column, not separate
    vehicle_type VARCHAR(50),                         -- Not color
    year INTEGER,
    color VARCHAR(30),                                -- Actual color column exists
    vin VARCHAR(17),
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_owner CHECK (
        (organization_id IS NOT NULL AND client_id IS NULL)
        OR (organization_id IS NULL AND client_id IS NOT NULL)
    )
);
```

---

## Frontend → Backend → Database Flow:

### Walk-in Client Creation:

```
Frontend (ClientFormEnhanced.jsx)
  ↓
  vehicleType: "SUV"
  makeModel: "Toyota Landcruiser"
  regNo: "KCA 123A"
  ↓
Backend (clientsController.js)
  ↓
  INSERT INTO vehicles:
    registration_number = "KCA 123A"
    make_model = "Toyota Landcruiser"
    vehicle_type = "SUV"
    year = 2025
    client_id = 1
  ↓
Database (vehicles table)
  ✅ Success!
```

### Organization Fleet Creation:

```
Frontend (OrganizationFormEnhanced.jsx)
  ↓
  vehicleType: "Truck"
  makeModel: "Isuzu FRR"
  regNo: "KCA 123T"
  ↓
Backend (organizationsController.js)
  ↓
  INSERT INTO vehicles:
    registration_number = "KCA 123T"
    make_model = "Isuzu FRR"
    vehicle_type = "Truck"
    year = 2025
    organization_id = 1
  ↓
Database (vehicles table)
  ✅ Success!
```

---

## Testing:

### Test 1: Create Walk-in Client with Vehicles

1. Login as admin
2. Navigate to "Add New Client"
3. Fill in client details:
   - Name: "John Doe"
   - Phone: "+254700123456"
   - Email: "john@example.com"
4. Add vehicle:
   - Vehicle Type: "SUV"
   - Make & Model: "Toyota Landcruiser"
   - Registration No.: "KCA 123A"
5. Click "Add Client"
6. ✅ Should succeed without "license_plate" error

### Test 2: Create Organization with Fleet

1. Navigate to "Add New Organization"
2. Fill in organization details:
   - Name: "ABC Transport Ltd"
   - Contact Person: "Jane Manager"
   - Phone: "+254700111222"
3. Add vehicles:
   - Vehicle 1: Truck, Isuzu FRR, KCA 123T
   - Vehicle 2: Van, Toyota Hiace, KCB 456V
4. Click "Add Organization"
5. ✅ Should succeed without "license_plate" error

---

## Status: ✅ FIXED

All database column name mismatches have been corrected. The system now uses:

- ✅ `registration_number` instead of `license_plate`
- ✅ `make_model` as single column (not split)
- ✅ `vehicle_type` for vehicle category

Ready for testing!
