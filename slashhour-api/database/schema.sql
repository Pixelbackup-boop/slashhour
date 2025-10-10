-- Slashhour Database Schema (MVP - Without PostGIS)
-- Uses JSONB for location storage instead of PostGIS geometry
-- Can be upgraded to PostGIS later for better performance

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255) UNIQUE,
    username VARCHAR(30) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    full_name VARCHAR(100),
    avatar_url VARCHAR(500),

    -- Location as JSONB: {lat: number, lng: number}
    default_location JSONB,
    default_radius_km INTEGER DEFAULT 5,

    -- Preferences
    preferred_categories TEXT[] DEFAULT '{}',
    language VARCHAR(10) DEFAULT 'en',
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'America/New_York',

    -- Inflation tracking
    monthly_savings_goal DECIMAL(10,2),
    inflation_rate_reference DECIMAL(5,2) DEFAULT 7.5,

    -- Status
    status VARCHAR(20) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP DEFAULT NOW()
);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id),

    -- Basic info
    business_name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,

    -- Essential category
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'restaurant', 'grocery', 'fashion', 'shoes',
        'electronics', 'home_living', 'beauty', 'health'
    )),
    subcategory VARCHAR(50),

    -- Location as JSONB: {lat: number, lng: number}
    location JSONB NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    country VARCHAR(2) NOT NULL,
    postal_code VARCHAR(20),

    -- Contact
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),

    -- Operating hours as JSONB
    hours JSONB,

    -- Media
    logo_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    images JSONB DEFAULT '[]',

    -- Stats
    follower_count INTEGER DEFAULT 0,
    total_deals_posted INTEGER DEFAULT 0,
    total_redemptions INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,

    -- Subscription
    subscription_tier VARCHAR(20) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,

    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP,

    -- Payment
    stripe_account_id VARCHAR(255),
    payment_enabled BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Follows table (core feature)
CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,

    -- Notification preferences
    notifications_enabled BOOLEAN DEFAULT TRUE,
    notification_types JSONB DEFAULT '{"new_deal": true, "expiring": true, "flash": true}',

    -- Engagement tracking
    last_viewed_at TIMESTAMP,
    deals_viewed_count INTEGER DEFAULT 0,
    deals_redeemed_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, business_id)
);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,

    -- Deal details
    title VARCHAR(200) NOT NULL,
    description TEXT,

    -- Pricing
    original_price DECIMAL(10,2) NOT NULL,
    discounted_price DECIMAL(10,2) NOT NULL,
    discount_percentage INTEGER GENERATED ALWAYS AS
        (ROUND(((original_price - discounted_price) / NULLIF(original_price, 0)) * 100)) STORED,
    savings_amount DECIMAL(10,2) GENERATED ALWAYS AS
        (original_price - discounted_price) STORED,

    -- Category
    category VARCHAR(50) NOT NULL,
    tags TEXT[] DEFAULT '{}',

    -- Timing
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_flash_deal BOOLEAN DEFAULT FALSE,

    -- Location visibility
    visibility_radius_km INTEGER DEFAULT 5,

    -- Inventory
    quantity_available INTEGER,
    quantity_redeemed INTEGER DEFAULT 0,
    max_per_user INTEGER DEFAULT 1,

    -- Terms
    terms_conditions TEXT[],
    valid_days VARCHAR(7) DEFAULT '1111111',

    -- Media
    images JSONB DEFAULT '[]',

    -- Stats
    view_count_followers INTEGER DEFAULT 0,
    view_count_nearby INTEGER DEFAULT 0,
    save_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'active',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Redemptions table
CREATE TABLE IF NOT EXISTS redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID REFERENCES deals(id),
    user_id UUID REFERENCES users(id),
    business_id UUID REFERENCES businesses(id),

    -- QR/Code
    redemption_code VARCHAR(20) UNIQUE NOT NULL,
    qr_code_data TEXT,

    -- Validation
    validated_at TIMESTAMP,
    validated_by UUID REFERENCES users(id),

    -- Financial
    original_price DECIMAL(10,2),
    discounted_price DECIMAL(10,2),
    amount_saved DECIMAL(10,2),

    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    parent_id INTEGER REFERENCES categories(id),
    order_index INTEGER DEFAULT 0,
    is_essential BOOLEAN DEFAULT TRUE
);

-- Savings tracker table
CREATE TABLE IF NOT EXISTS savings_tracker (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    redemption_id UUID REFERENCES redemptions(id),

    amount_saved DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    business_name VARCHAR(200),

    month DATE NOT NULL,
    year INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),

    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,

    -- Context
    deal_id UUID REFERENCES deals(id),
    business_id UUID REFERENCES businesses(id),

    -- Delivery
    channels JSONB DEFAULT '{"push": true, "in_app": true}',

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses USING GIN(location);

CREATE INDEX IF NOT EXISTS idx_follows_user_id ON follows(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_business_id ON follows(business_id);
CREATE INDEX IF NOT EXISTS idx_follows_user_business ON follows(user_id, business_id);

CREATE INDEX IF NOT EXISTS idx_deals_business_id ON deals(business_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_expires_at ON deals(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_deals_category ON deals(category);

CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_deal_id ON redemptions(deal_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_code ON redemptions(redemption_code);

CREATE INDEX IF NOT EXISTS idx_savings_user_month ON savings_tracker(user_id, month);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Insert essential categories
INSERT INTO categories (key, name, icon, order_index) VALUES
('restaurant', 'Restaurants & Food', '🍕', 1),
('grocery', 'Grocery & Supermarkets', '🛒', 2),
('fashion', 'Fashion & Clothing', '👗', 3),
('shoes', 'Shoes & Footwear', '👟', 4),
('electronics', 'Electronics & Gadgets', '📱', 5),
('home_living', 'Home & Living', '🏠', 6),
('beauty', 'Beauty & Personal Care', '💄', 7),
('health', 'Health & Pharmacy', '⚕️', 8)
ON CONFLICT (key) DO NOTHING;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
