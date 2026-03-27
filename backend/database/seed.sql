-- Database Seed Script for Testing

-- 1. Insert dummy users
INSERT INTO users (id, name, email, password, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'Admin user', 'admin@example.com', 'hashedpass', 'admin'),
('22222222-2222-2222-2222-222222222222', 'Regular user', 'user@example.com', 'hashedpass', 'user');

-- 2. Insert dummy cars
INSERT INTO cars (id, name, price, type, description, specs, location, images) VALUES
('33333333-3333-3333-3333-333333333333', '2024 Toyota Hilux', 45000.00, 'sale', 'Brand new Hilux truck', '{"color": "white", "transmission": "manual"}', 'Addis Ababa', '["image1.jpg", "image2.jpg"]'),
('44444444-4444-4444-4444-444444444444', '2021 Hyundai Tucson', 25000.00, 'sale', 'Used family SUV', '{"color": "silver", "transmission": "automatic"}', 'Dire Dawa', '["image3.jpg"]');

-- 3. Insert a custom active lottery
INSERT INTO lottery_settings (id, start_number, end_number, prize_car_id, prize_text, status) VALUES
('55555555-5555-5555-5555-555555555555', 1, 1000, '33333333-3333-3333-3333-333333333333', NULL, 'active');

-- 4. Insert dummy lottery numbers (simulating user interactions)
-- User has bought ticket #100 and it's pending their payment verification
INSERT INTO lottery_numbers (id, number, status, user_id, lottery_id, expires_at) VALUES
('66666666-6666-6666-6666-666666666666', 100, 'pending', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', NOW() + INTERVAL '1 hour'),
-- Ticket #200 is available for anyone to buy
('77777777-7777-7777-7777-777777777777', 200, 'available', NULL, '55555555-5555-5555-5555-555555555555', NULL);

-- 5. Insert dummy payment details for the pending checkout
INSERT INTO payments (id, user_id, lottery_number_id, receipt_url, method, status) VALUES
('88888888-8888-8888-8888-888888888888', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666', 'https://example.com/receipt.jpg', 'CBE', 'pending');
