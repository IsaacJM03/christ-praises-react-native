-- Add profile fields to users table (compatible version)
-- Run each statement separately if needed

-- Check your current table structure first:
-- DESCRIBE users;

-- Add image/avatar column
ALTER TABLE users ADD COLUMN image VARCHAR(500) NULL;

-- Add bio column  
ALTER TABLE users ADD COLUMN bio TEXT NULL;

-- Add phone column
ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL;

-- Add address column
ALTER TABLE users ADD COLUMN address VARCHAR(255) NULL;

-- Add email_verified column
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
