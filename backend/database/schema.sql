-- Enable UUID extension (Required for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM TYPES
CREATE TYPE user_role AS ENUM ('user', 'admin', 'lottery_staff');
CREATE TYPE car_type AS ENUM ('sale', 'rental');
CREATE TYPE lottery_status AS ENUM ('active', 'closed');
CREATE TYPE lottery_number_status AS ENUM ('available', 'pending', 'confirmed');
CREATE TYPE payment_method AS ENUM ('CBE', 'Telebirr');
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected');

-- TRIGGER FUNCTION FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_timestamp_columns() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Cars Table
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    type car_type NOT NULL,
    description TEXT,
    specs JSONB,
    location VARCHAR(255),
    images JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Lottery Settings Table
CREATE TABLE lottery_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    start_number INTEGER NOT NULL,
    end_number INTEGER NOT NULL,
    prize_car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
    prize_text VARCHAR(255),
    status lottery_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT has_prize CHECK (prize_car_id IS NOT NULL OR prize_text IS NOT NULL),
    CONSTRAINT valid_number_range CHECK (end_number >= start_number)
);

-- 4. Lottery Numbers Table
CREATE TABLE lottery_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL,
    status lottery_number_status NOT NULL DEFAULT 'available',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    lottery_id UUID NOT NULL REFERENCES lottery_settings(id) ON DELETE CASCADE,
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(lottery_id, number)
);

-- 5. Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lottery_number_id UUID NOT NULL REFERENCES lottery_numbers(id) ON DELETE CASCADE,
    receipt_url VARCHAR(512) NOT NULL,
    method payment_method NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(100) NOT NULL,
    performed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRIGGERS
CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_timestamp_columns();
CREATE TRIGGER set_cars_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION update_timestamp_columns();
CREATE TRIGGER set_lottery_settings_updated_at BEFORE UPDATE ON lottery_settings FOR EACH ROW EXECUTE FUNCTION update_timestamp_columns();
CREATE TRIGGER set_lottery_numbers_updated_at BEFORE UPDATE ON lottery_numbers FOR EACH ROW EXECUTE FUNCTION update_timestamp_columns();
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_timestamp_columns();

-- INDEXES
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_cars_type ON cars(type);
CREATE INDEX idx_cars_price ON cars(price);
CREATE INDEX idx_lottery_settings_status ON lottery_settings(status);
CREATE INDEX idx_lottery_numbers_lottery_id ON lottery_numbers(lottery_id);
CREATE INDEX idx_lottery_numbers_user_id ON lottery_numbers(user_id);
CREATE INDEX idx_lottery_numbers_status_expires ON lottery_numbers(status, expires_at) WHERE status = 'pending';
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_lottery_number_id ON payments(lottery_number_id);
