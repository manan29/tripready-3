# Database Migrations

## Archive Feature Migration

To enable the archive feature, run the following SQL in your Supabase SQL editor:

```sql
-- Add archived column to trips table
ALTER TABLE trips ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_trips_archived ON trips(archived);

-- Update existing trips to be not archived
UPDATE trips SET archived = FALSE WHERE archived IS NULL;
```

Or run the migration file:
```bash
# If using Supabase CLI
supabase db push
```

The migration file is located at: `supabase/migrations/add_archived_column.sql`
