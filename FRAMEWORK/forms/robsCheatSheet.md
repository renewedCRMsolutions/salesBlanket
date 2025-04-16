-- Table structure
SELECT * FROM information_schema.columns 
WHERE table_name = 'pulse_scans' 
ORDER BY ordinal_position;

-- Primary key
SELECT * FROM information_schema.table_constraints 
WHERE table_name = 'pulse_scans' AND constraint_type = 'PRIMARY KEY';

-- Indexes
SELECT 
    indexname, 
    indexdef 
FROM 
    pg_indexes 
WHERE 
    tablename = 'pulse_scans';

pull constraints

SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM 
    information_schema.columns 
WHERE 
    table_name = 'pulse_scans' 
ORDER BY 
    ordinal_position;

pull schema

ALTER TABLE address_types 
ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC',
ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';

ALTER TABLE address_types 
ALTER COLUMN id SET DEFAULT uuid_generate_v4();