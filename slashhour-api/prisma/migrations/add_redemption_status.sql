-- Migration: Add status tracking to user_redemptions table
-- Purpose: Track redemption validation status for business owners
-- Date: 2025-01-10

-- Add status column with default 'pending'
ALTER TABLE user_redemptions
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' NOT NULL;

-- Add validated_at timestamp (null until validated)
ALTER TABLE user_redemptions
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP NULL;

-- Add validated_by to track which user/staff validated
ALTER TABLE user_redemptions
ADD COLUMN IF NOT EXISTS validated_by VARCHAR(255) NULL;

-- Create index for faster business redemption queries
CREATE INDEX IF NOT EXISTS idx_user_redemptions_business_status
ON user_redemptions(business_id, status);

-- Create index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_user_redemptions_redeemed_at
ON user_redemptions(redeemed_at DESC);

-- Add check constraint to ensure valid status values
ALTER TABLE user_redemptions
ADD CONSTRAINT chk_redemption_status
CHECK (status IN ('pending', 'validated', 'expired', 'cancelled'));

-- Comment on columns
COMMENT ON COLUMN user_redemptions.status IS 'Redemption status: pending (waiting validation), validated (confirmed by business), expired (not used in time), cancelled (voided)';
COMMENT ON COLUMN user_redemptions.validated_at IS 'Timestamp when business owner validated the redemption';
COMMENT ON COLUMN user_redemptions.validated_by IS 'User ID or identifier of person who validated the redemption';
