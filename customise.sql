-- CircuitIQ Database Customisations

-- Add columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS graduation_year INT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student',
ADD COLUMN IF NOT EXISTS phone           TEXT,
ADD COLUMN IF NOT EXISTS is_active       BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT NOW();

-- Add columns to circuits
ALTER TABLE circuits
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS status          TEXT    DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS view_count      INT     DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_deleted      BOOLEAN DEFAULT FALSE;

-- Add columns to experiment_logs
ALTER TABLE experiment_logs
ADD COLUMN IF NOT EXISTS duration_seconds INT,
ADD COLUMN IF NOT EXISTS score NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS status          TEXT    DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS attempt_number  INT     DEFAULT 1,
ADD COLUMN IF NOT EXISTS feedback        TEXT;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- VERIFY: Check all columns were added

-- Check profiles columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check circuits columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'circuits'
ORDER BY ordinal_position;

-- Check experiment_logs columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'experiment_logs'
ORDER BY ordinal_position;
