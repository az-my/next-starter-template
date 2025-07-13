-- Migration: Fix Google Sheets sync tracking column in incident_serpo table
-- Run this in your Supabase SQL editor

-- Check if the incorrect column exists and remove it
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'incident_serpo' 
               AND column_name = 'is_synced_to_sheets') THEN
        -- Drop the incorrect column if it exists
        ALTER TABLE incident_serpo DROP COLUMN is_synced_to_sheets;
    END IF;
END $$;

-- Ensure the correct column exists (is_synced_to_sheet - singular)
ALTER TABLE incident_serpo 
ADD COLUMN IF NOT EXISTS is_synced_to_sheet BOOLEAN DEFAULT FALSE;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_incident_serpo_sheet_sync 
ON incident_serpo(is_synced_to_sheet) 
WHERE is_synced_to_sheet = FALSE;

-- Add a comment to document the column
COMMENT ON COLUMN incident_serpo.is_synced_to_sheet IS 'Tracks whether this record has been synced to Google Sheets';

-- Update existing records to mark them as not synced (if you want to sync existing data)
UPDATE incident_serpo SET is_synced_to_sheet = FALSE WHERE is_synced_to_sheet IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'incident_serpo' 
AND column_name = 'is_synced_to_sheet';

-- Show current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'incident_serpo' 
ORDER BY ordinal_position;