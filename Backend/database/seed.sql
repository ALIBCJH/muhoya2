-- ============================================
-- SEED DATA FOR MUHOYA GARAGE MANAGEMENT SYSTEM
-- ============================================
-- Clear existing data (in reverse order)
TRUNCATE TABLE invoice_items,
invoices,
service_parts,
service_records,
parts,
vehicles,
clients,
organizations,
users RESTART IDENTITY CASCADE;
-- ============================================
-- USERS (Passwords: "password123" - hashed with bcrypt)
-- ============================================
INSERT INTO users (fullname, email, password, role)
VALUES (
        'Admin User',
        'admin@muhoya.com',
        '$2b$10$rN6KhBQcXRZ0cVZ5OqXZHuLQ1U8XYqYBQo8j5XQZpYqYBQo8j5XQZ',
        'admin'
    ),
    (
        'John Mechanic',
        'mechanic@muhoya.com',
        '$2b$10$rN6KhBQcXRZ0cVZ5OqXZHuLQ1U8XYqYBQo8j5XQZpYqYBQo8j5XQZ',
        'mechanic'
    ),
    (
        'Jane Receptionist',
        'receptionist@muhoya.com',
        '$2b$10$rN6KhBQcXRZ0cVZ5OqXZHuLQ1U8XYqYBQo8j5XQZpYqYBQo8j5XQZ',
        'receptionist'
    );
-- ============================================
-- ORGANIZATIONS (Fleet Clients)
-- ============================================
INSERT INTO organizations (name, address, contact_person, phone, email)
VALUES (
        'Kenya Power Ltd',
        'Nairobi CBD, Kenya',
        'James Mwangi',
        '+254 700 100 100',
        'fleet@kenyapower.co.ke'
    ),
    (
        'Safaricom PLC',
        'Westlands, Nairobi',
        'Mary Wanjiru',
        '+254 700 200 200',
        'operations@safaricom.co.ke'
    ),
    (
        'Kenya Airways',
        'Embakasi, Nairobi',
        'Peter Kamau',
        '+254 700 300 300',
        'maintenance@kenya-airways.com'
    ),
    (
        'Nairobi Water',
        'Industrial Area, Nairobi',
        'Grace Njeri',
        '+254 700 400 400',
        'logistics@nairobiwater.co.ke'
    );
-- ============================================
-- CLIENTS (Walk-in Customers)
-- ============================================
INSERT INTO clients (name, email, phone, address)
VALUES (
        'John Doe',
        'john.doe@email.com',
        '+254 700 123 456',
        'Karen, Nairobi'
    ),
    (
        'Jane Smith',
        'jane.smith@email.com',
        '+254 700 234 567',
        'Kilimani, Nairobi'
    ),
    (
        'Michael Brown',
        'michael@email.com',
        '+254 700 345 678',
        'Parklands, Nairobi'
    ),
    (
        'Sarah Wilson',
        'sarah.w@email.com',
        '+254 700 456 789',
        'Westlands, Nairobi'
    ),
    (
        'David Lee',
        'david.lee@email.com',
        '+254 700 567 890',
        'Lavington, Nairobi'
    );
-- ============================================
-- VEHICLES (Mixed: Organizational & Individual)
-- ============================================
-- Kenya Power vehicles
INSERT INTO vehicles (
        registration_number,
        make_model,
        vehicle_type,
        year,
        color,
        organization_id
    )
VALUES (
        'KAA 123A',
        'Toyota Hilux',
        'Truck',
        2020,
        'White',
        1
    ),
    (
        'KAB 456B',
        'Isuzu D-Max',
        'Truck',
        2019,
        'White',
        1
    ),
    (
        'KAC 789C',
        'Nissan NV200',
        'Van',
        2021,
        'Silver',
        1
    );
-- Safaricom vehicles
INSERT INTO vehicles (
        registration_number,
        make_model,
        vehicle_type,
        year,
        color,
        organization_id
    )
VALUES (
        'KBB 111D',
        'Toyota Land Cruiser',
        'SUV',
        2022,
        'Green',
        2
    ),
    (
        'KBC 222E',
        'Ford Ranger',
        'Truck',
        2021,
        'Green',
        2
    ),
    (
        'KBD 333F',
        'Mitsubishi L200',
        'Truck',
        2020,
        'Green',
        2
    );
-- Kenya Airways vehicles
INSERT INTO vehicles (
        registration_number,
        make_model,
        vehicle_type,
        year,
        color,
        organization_id
    )
VALUES (
        'KCA 444G',
        'Toyota Coaster',
        'Bus',
        2019,
        'Blue',
        3
    ),
    (
        'KCB 555H',
        'Nissan Urvan',
        'Van',
        2020,
        'Blue',
        3
    );
-- Individual client vehicles
INSERT INTO vehicles (
        registration_number,
        make_model,
        vehicle_type,
        year,
        color,
        client_id
    )
VALUES (
        'KDD 100A',
        'Toyota Corolla',
        'Car',
        2018,
        'Red',
        1
    ),
    (
        'KDE 200B',
        'Honda Civic',
        'Car',
        2019,
        'Black',
        2
    ),
    (
        'KDF 300C',
        'Nissan X-Trail',
        'SUV',
        2020,
        'Silver',
        2
    ),
    (
        'KDG 400D',
        'Mazda Demio',
        'Car',
        2017,
        'Blue',
        3
    ),
    (
        'KDH 500E',
        'Toyota Prado',
        'SUV',
        2021,
        'White',
        4
    ),
    (
        'KDI 600F',
        'Subaru Forester',
        'SUV',
        2019,
        'Gray',
        5
    );
-- ============================================
-- PARTS (Inventory)
-- ============================================
INSERT INTO parts (
        part_name,
        part_code,
        description,
        buying_price,
        selling_price_min,
        selling_price_max,
        stock_quantity,
        reorder_level
    )
VALUES (
        'Brake Pads',
        'BP-001',
        'Front brake pads - universal',
        1500.00,
        2000.00,
        2500.00,
        25,
        10
    ),
    (
        'Oil Filter',
        'OF-001',
        'Engine oil filter',
        300.00,
        500.00,
        700.00,
        50,
        15
    ),
    (
        'Air Filter',
        'AF-001',
        'Air filter element',
        400.00,
        600.00,
        800.00,
        30,
        10
    ),
    (
        'Spark Plugs',
        'SP-001',
        'NGK spark plugs (set of 4)',
        800.00,
        1200.00,
        1500.00,
        40,
        15
    ),
    (
        'Engine Oil',
        'EO-001',
        'Synthetic 5W-30 (5L)',
        2000.00,
        3000.00,
        3500.00,
        60,
        20
    ),
    (
        'Battery',
        'BAT-001',
        '12V 70Ah car battery',
        8000.00,
        12000.00,
        15000.00,
        15,
        5
    ),
    (
        'Brake Disc',
        'BD-001',
        'Front brake disc (pair)',
        3500.00,
        5000.00,
        6000.00,
        20,
        8
    ),
    (
        'Shock Absorber',
        'SA-001',
        'Front shock absorber',
        2500.00,
        4000.00,
        5000.00,
        8,
        5
    ),
    (
        'Timing Belt',
        'TB-001',
        'Timing belt kit',
        3000.00,
        4500.00,
        5500.00,
        12,
        6
    ),
    (
        'Radiator',
        'RAD-001',
        'Aluminum radiator',
        5000.00,
        8000.00,
        10000.00,
        5,
        3
    );
-- ============================================
-- SERVICE RECORDS
-- ============================================
-- Completed services
INSERT INTO service_records (
        vehicle_id,
        service_date,
        description,
        mileage,
        labour_cost,
        parts_total,
        total_amount,
        status,
        mechanic_name,
        notes
    )
VALUES (
        1,
        '2025-01-15',
        'Regular maintenance - Oil change and filter replacement',
        45000,
        1500.00,
        3500.00,
        5000.00,
        'completed',
        'John Mechanic',
        'Customer requested synthetic oil'
    ),
    (
        10,
        '2025-01-20',
        'Brake service - Replaced front brake pads',
        82000,
        2000.00,
        2500.00,
        4500.00,
        'completed',
        'John Mechanic',
        'Rear brakes OK'
    ),
    (
        12,
        '2025-01-22',
        'Battery replacement',
        95000,
        500.00,
        15000.00,
        15500.00,
        'completed',
        'John Mechanic',
        'Old battery completely dead'
    );
-- In-progress services
INSERT INTO service_records (
        vehicle_id,
        service_date,
        description,
        mileage,
        labour_cost,
        parts_total,
        total_amount,
        status,
        mechanic_name,
        notes
    )
VALUES (
        2,
        '2025-02-01',
        'Major service - Engine overhaul',
        120000,
        8000.00,
        15000.00,
        23000.00,
        'in_progress',
        'John Mechanic',
        'Expected completion: 3 days'
    ),
    (
        11,
        '2025-02-05',
        'Suspension repair',
        67000,
        3000.00,
        5000.00,
        8000.00,
        'in_progress',
        'John Mechanic',
        'Replacing front shock absorbers'
    );
-- Pending services
INSERT INTO service_records (
        vehicle_id,
        service_date,
        description,
        mileage,
        labour_cost,
        parts_total,
        total_amount,
        status,
        mechanic_name,
        notes
    )
VALUES (
        5,
        CURRENT_DATE,
        'Diagnostic check - Engine warning light',
        55000,
        0,
        0,
        0,
        'pending',
        NULL,
        'Awaiting mechanic assignment'
    ),
    (
        14,
        CURRENT_DATE,
        'Regular maintenance',
        30000,
        0,
        0,
        0,
        'pending',
        NULL,
        'Scheduled for tomorrow'
    );
-- ============================================
-- SERVICE_PARTS (Parts used in services)
-- ============================================
-- Service 1 (Oil change)
INSERT INTO service_parts (
        service_id,
        part_id,
        quantity,
        unit_price,
        subtotal
    )
VALUES (1, 5, 1, 3500.00, 3500.00),
    -- Engine oil
    (1, 2, 1, 500.00, 500.00);
-- Oil filter
-- Service 2 (Brake service)
INSERT INTO service_parts (
        service_id,
        part_id,
        quantity,
        unit_price,
        subtotal
    )
VALUES (2, 1, 1, 2500.00, 2500.00);
-- Brake pads
-- Service 3 (Battery replacement)
INSERT INTO service_parts (
        service_id,
        part_id,
        quantity,
        unit_price,
        subtotal
    )
VALUES (3, 6, 1, 15000.00, 15000.00);
-- Battery
-- Service 4 (Engine overhaul)
INSERT INTO service_parts (
        service_id,
        part_id,
        quantity,
        unit_price,
        subtotal
    )
VALUES (4, 9, 1, 5500.00, 5500.00),
    -- Timing belt
    (4, 4, 1, 1500.00, 1500.00),
    -- Spark plugs
    (4, 5, 2, 3500.00, 7000.00),
    -- Engine oil (2 units)
    (4, 2, 1, 500.00, 500.00);
-- Oil filter
-- Service 5 (Suspension)
INSERT INTO service_parts (
        service_id,
        part_id,
        quantity,
        unit_price,
        subtotal
    )
VALUES (5, 8, 2, 5000.00, 10000.00);
-- Shock absorbers (2 units)
-- ============================================
-- INVOICES
-- ============================================
-- Paid invoices
INSERT INTO invoices (
        invoice_number,
        service_id,
        issue_date,
        due_date,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        status,
        payment_date,
        payment_method
    )
VALUES (
        'INV202501150001',
        1,
        '2025-01-15',
        '2025-01-30',
        5000.00,
        800.00,
        0,
        5800.00,
        'paid',
        '2025-01-16',
        'M-Pesa'
    ),
    (
        'INV202501200002',
        2,
        '2025-01-20',
        '2025-02-04',
        4500.00,
        720.00,
        200.00,
        5020.00,
        'paid',
        '2025-01-20',
        'Cash'
    ),
    (
        'INV202501220003',
        3,
        '2025-01-22',
        '2025-02-06',
        15500.00,
        2480.00,
        500.00,
        17480.00,
        'paid',
        '2025-01-25',
        'Bank Transfer'
    );
-- Unpaid invoices
INSERT INTO invoices (
        invoice_number,
        service_id,
        issue_date,
        due_date,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        status
    )
VALUES (
        'INV202502010004',
        4,
        '2025-02-01',
        '2025-02-15',
        23000.00,
        3680.00,
        1000.00,
        25680.00,
        'unpaid'
    ),
    (
        'INV202502050005',
        5,
        '2025-02-05',
        '2025-02-19',
        8000.00,
        1280.00,
        0,
        9280.00,
        'unpaid'
    );
-- ============================================
-- INVOICE_ITEMS (Detailed breakdown)
-- ============================================
-- Invoice 1 items
INSERT INTO invoice_items (
        invoice_id,
        item_type,
        description,
        quantity,
        unit_price,
        subtotal
    )
VALUES (
        1,
        'labour',
        'Labour - Oil change service',
        1,
        1500.00,
        1500.00
    ),
    (
        1,
        'part',
        'Engine Oil - Synthetic 5W-30 (5L)',
        1,
        3500.00,
        3500.00
    ),
    (1, 'part', 'Oil Filter', 1, 500.00, 500.00);
-- Invoice 2 items
INSERT INTO invoice_items (
        invoice_id,
        item_type,
        description,
        quantity,
        unit_price,
        subtotal
    )
VALUES (
        2,
        'labour',
        'Labour - Brake service',
        1,
        2000.00,
        2000.00
    ),
    (
        2,
        'part',
        'Front Brake Pads',
        1,
        2500.00,
        2500.00
    );
-- Invoice 3 items
INSERT INTO invoice_items (
        invoice_id,
        item_type,
        description,
        quantity,
        unit_price,
        subtotal
    )
VALUES (
        3,
        'labour',
        'Labour - Battery replacement',
        1,
        500.00,
        500.00
    ),
    (
        3,
        'part',
        '12V 70Ah Car Battery',
        1,
        15000.00,
        15000.00
    );
-- Invoice 4 items
INSERT INTO invoice_items (
        invoice_id,
        item_type,
        description,
        quantity,
        unit_price,
        subtotal
    )
VALUES (
        4,
        'labour',
        'Labour - Engine overhaul',
        1,
        8000.00,
        8000.00
    ),
    (
        4,
        'part',
        'Timing Belt Kit',
        1,
        5500.00,
        5500.00
    ),
    (
        4,
        'part',
        'Spark Plugs (set of 4)',
        1,
        1500.00,
        1500.00
    ),
    (
        4,
        'part',
        'Engine Oil - Synthetic (2 units)',
        2,
        3500.00,
        7000.00
    ),
    (4, 'part', 'Oil Filter', 1, 500.00, 500.00);
-- Invoice 5 items
INSERT INTO invoice_items (
        invoice_id,
        item_type,
        description,
        quantity,
        unit_price,
        subtotal
    )
VALUES (
        5,
        'labour',
        'Labour - Suspension repair',
        1,
        3000.00,
        3000.00
    ),
    (
        5,
        'part',
        'Front Shock Absorbers (pair)',
        2,
        5000.00,
        10000.00
    );
-- ============================================
-- VERIFY DATA
-- ============================================
SELECT 'Users' AS table_name,
    COUNT(*) AS count
FROM users
UNION ALL
SELECT 'Organizations',
    COUNT(*)
FROM organizations
UNION ALL
SELECT 'Clients',
    COUNT(*)
FROM clients
UNION ALL
SELECT 'Vehicles',
    COUNT(*)
FROM vehicles
UNION ALL
SELECT 'Parts',
    COUNT(*)
FROM parts
UNION ALL
SELECT 'Service Records',
    COUNT(*)
FROM service_records
UNION ALL
SELECT 'Service Parts',
    COUNT(*)
FROM service_parts
UNION ALL
SELECT 'Invoices',
    COUNT(*)
FROM invoices
UNION ALL
SELECT 'Invoice Items',
    COUNT(*)
FROM invoice_items;