-- ============================================
-- MUHOYA GARAGE MANAGEMENT SYSTEM
-- PostgreSQL Database Schema
-- ============================================
-- Drop existing tables (in reverse order of dependencies)
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS service_parts CASCADE;
DROP TABLE IF EXISTS service_records CASCADE;
DROP TABLE IF EXISTS parts CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;
-- ============================================
-- USERS TABLE (Authentication)
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'mechanic', 'receptionist')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
-- ============================================
-- ORGANIZATIONS TABLE (Fleet Clients)
-- ============================================
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_organizations_name ON organizations(name);
-- ============================================
-- CLIENTS TABLE (Walk-in Clients)
-- ============================================
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_phone ON clients(phone);
-- ============================================
-- VEHICLES TABLE (Cars/Trucks/Vans)
-- ============================================
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    make_model VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(50),
    year INTEGER,
    color VARCHAR(30),
    vin VARCHAR(17),
    -- Foreign Keys (Either organization OR client, not both)
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Ensure vehicle belongs to either org or client, not both
    CONSTRAINT check_owner CHECK (
        (
            organization_id IS NOT NULL
            AND client_id IS NULL
        )
        OR (
            organization_id IS NULL
            AND client_id IS NOT NULL
        )
    )
);
CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX idx_vehicles_organization ON vehicles(organization_id);
CREATE INDEX idx_vehicles_client ON vehicles(client_id);
-- ============================================
-- PARTS TABLE (Inventory)
-- ============================================
CREATE TABLE parts (
    id SERIAL PRIMARY KEY,
    part_name VARCHAR(100) NOT NULL,
    part_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    buying_price DECIMAL(10, 2) NOT NULL,
    selling_price_min DECIMAL(10, 2),
    selling_price_max DECIMAL(10, 2),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    reorder_level INTEGER DEFAULT 10,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_parts_code ON parts(part_code);
CREATE INDEX idx_parts_stock ON parts(stock_quantity);
-- ============================================
-- SERVICE_RECORDS TABLE (Service History)
-- ============================================
CREATE TABLE service_records (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_date DATE NOT NULL DEFAULT CURRENT_DATE,
    -- Service Details
    description TEXT,
    mileage INTEGER,
    labour_cost DECIMAL(10, 2) DEFAULT 0,
    parts_total DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'in_progress',
            'completed',
            'cancelled'
        )
    ),
    -- Mechanic assigned
    mechanic_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_service_records_vehicle ON service_records(vehicle_id);
CREATE INDEX idx_service_records_date ON service_records(service_date);
CREATE INDEX idx_service_records_status ON service_records(status);
-- ============================================
-- SERVICE_PARTS TABLE (Junction: Services ↔ Parts)
-- ============================================
CREATE TABLE service_parts (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES service_records(id) ON DELETE CASCADE,
    part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id, part_id)
);
CREATE INDEX idx_service_parts_service ON service_parts(service_id);
CREATE INDEX idx_service_parts_part ON service_parts(part_id);
-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    service_id INTEGER NOT NULL REFERENCES service_records(id) ON DELETE RESTRICT,
    -- Invoice Details
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    -- Amounts
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    -- Payment
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (
        status IN ('unpaid', 'paid', 'overdue', 'cancelled')
    ),
    payment_date DATE,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_service ON invoices(service_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(issue_date);
-- ============================================
-- INVOICE_ITEMS TABLE (Detailed line items)
-- ============================================
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('part', 'labour', 'other')),
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_users_updated_at BEFORE
UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE
UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE
UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE
UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parts_updated_at BEFORE
UPDATE ON parts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_records_updated_at BEFORE
UPDATE ON service_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE
UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================
-- View: Vehicle with Owner Information
CREATE OR REPLACE VIEW vehicles_with_owners AS
SELECT v.*,
    CASE
        WHEN v.organization_id IS NOT NULL THEN 'organization'
        WHEN v.client_id IS NOT NULL THEN 'client'
    END AS owner_type,
    COALESCE(o.name, c.name) AS owner_name,
    COALESCE(o.phone, c.phone) AS owner_phone,
    COALESCE(o.email, c.email) AS owner_email
FROM vehicles v
    LEFT JOIN organizations o ON v.organization_id = o.id
    LEFT JOIN clients c ON v.client_id = c.id;
-- View: Service Records with Vehicle and Owner Info
CREATE OR REPLACE VIEW service_records_detailed AS
SELECT sr.*,
    v.registration_number,
    v.make_model,
    v.vehicle_type,
    vo.owner_type,
    vo.owner_name,
    vo.owner_phone
FROM service_records sr
    JOIN vehicles v ON sr.vehicle_id = v.id
    JOIN vehicles_with_owners vo ON v.id = vo.id;
-- View: Invoices with Full Details
CREATE OR REPLACE VIEW invoices_detailed AS
SELECT i.*,
    sr.service_date,
    sr.description AS service_description,
    v.registration_number,
    v.make_model,
    vo.owner_name AS customer_name,
    vo.owner_phone AS customer_phone,
    vo.owner_email AS customer_email
FROM invoices i
    JOIN service_records sr ON i.service_id = sr.id
    JOIN vehicles v ON sr.vehicle_id = v.id
    JOIN vehicles_with_owners vo ON v.id = vo.id;
-- ============================================
-- ANALYTICS VIEWS
-- ============================================
-- View: Low Stock Parts
CREATE OR REPLACE VIEW low_stock_parts AS
SELECT id,
    part_name,
    part_code,
    stock_quantity,
    reorder_level,
    (reorder_level - stock_quantity) AS shortage
FROM parts
WHERE stock_quantity <= reorder_level
ORDER BY stock_quantity ASC;
-- View: Monthly Revenue Summary
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT DATE_TRUNC('month', issue_date) AS month,
    COUNT(*) AS invoice_count,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS average_invoice
FROM invoices
WHERE status = 'paid'
GROUP BY DATE_TRUNC('month', issue_date)
ORDER BY month DESC;
-- ============================================
-- FUNCTIONS
-- ============================================
-- Function: Generate Invoice Number
CREATE OR REPLACE FUNCTION generate_invoice_number() RETURNS VARCHAR(50) AS $$
DECLARE new_number VARCHAR(50);
year_part VARCHAR(4);
month_part VARCHAR(2);
sequence_part INTEGER;
BEGIN year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
month_part := TO_CHAR(CURRENT_DATE, 'MM');
SELECT COALESCE(
        MAX(
            CAST(
                SUBSTRING(
                    invoice_number
                    FROM 8
                ) AS INTEGER
            )
        ),
        0
    ) + 1 INTO sequence_part
FROM invoices
WHERE invoice_number LIKE 'INV' || year_part || month_part || '%';
new_number := 'INV' || year_part || month_part || LPAD(sequence_part::TEXT, 4, '0');
RETURN new_number;
END;
$$ LANGUAGE plpgsql;
-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE users IS 'System users with authentication';
COMMENT ON TABLE organizations IS 'Fleet clients with multiple vehicles';
COMMENT ON TABLE clients IS 'Individual walk-in customers';
COMMENT ON TABLE vehicles IS 'Vehicles owned by organizations or clients';
COMMENT ON TABLE parts IS 'Spare parts inventory';
COMMENT ON TABLE service_records IS 'Service history for vehicles';
COMMENT ON TABLE service_parts IS 'Junction table linking services to parts used';
COMMENT ON TABLE invoices IS 'Customer invoices for services';
COMMENT ON TABLE invoice_items IS 'Detailed line items in invoices';
-- ============================================
-- GRANT PERMISSIONS (adjust as needed)
-- ============================================
-- Create application user (if needed)
-- CREATE USER garage_app WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO garage_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO garage_app;