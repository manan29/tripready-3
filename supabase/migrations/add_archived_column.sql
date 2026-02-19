-- Add archived column to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_trips_archived ON trips(archived);

-- Update existing trips to be not archived
UPDATE trips SET archived = FALSE WHERE archived IS NULL;
