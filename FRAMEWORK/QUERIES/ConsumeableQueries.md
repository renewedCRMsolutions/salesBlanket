# Queries for the PostGreSQL DB

**DB Queries:**

- Roles and Permissions - DBrolesandpermissions.csv

  SELECT r.id AS role_id, rp.permissions_id, rp.created_at AS role_permission_created_at,
  r.display_name, r.description AS role_description, r.status AS role_status,
  p.name AS permission_name, p.resource AS permission_resource, p.action AS permission_action
  FROM role_permissions rp
  JOIN roles r ON rp.roles_id = r.id
  JOIN permissions p ON rp.permissions_id = p.id;

- Query for Permissions table - DBqueryforpermissions.csv

  SELECT
  id AS permission_id,
  name AS permission_name,
  description,
  resource,
  action,
  status,
  created_at,
  updated_at
  FROM permissions;

- Query for database schema - DBqueryfordatabaseschema.csv

  SELECT
  t.table_name,
  c.column_name,
  c.data_type,
  c.character_maximum_length,
  c.is_nullable,
  c.column_default,
  pd.description AS column_description
  FROM
  information_schema.columns c
  JOIN
  information_schema.tables t ON c.table_name = t.table_name
  AND c.table_schema = t.table_schema
  LEFT JOIN
  pg_description pd ON pd.objoid = (c.table_name::regclass)::oid
  AND pd.objsubid = c.ordinal_position
  WHERE
  t.table_schema = 'public'
  ORDER BY
  t.table_name, c.ordinal_position;

  

- Query for database functions - DBfunctions.csv

SELECT
pg_get_functiondef(p.oid) as function_definition
FROM
pg_proc p
JOIN
pg_namespace n ON p.pronamespace = n.oid
WHERE
n.nspname = 'public'
AND p.prokind = 'f' -- Only regular functions (not aggregates/procedures)
AND p.proname NOT LIKE 'pg\*%'
AND EXISTS (
SELECT 1 FROM pg_trigger t
WHERE t.tgfoid = p.oid
);

- Query for database triggers - DBtriggers.csv

SELECT
event_object_table AS table_name,
trigger_name,
'CREATE TRIGGER ' ||
trigger_name || ' ' ||
action_timing || ' ' ||
event_manipulation || ' ON ' ||
event_object_schema || '.' || event_object_table || ' ' ||
CASE
WHEN action_orientation = 'ROW' THEN 'FOR EACH ROW '
ELSE 'FOR EACH STATEMENT '
END ||
CASE
WHEN action_condition IS NOT NULL THEN 'WHEN (' || action_condition || ') '
ELSE ''
END ||
'EXECUTE FUNCTION ' || action_statement || ';' AS trigger_script
FROM
information_schema.triggers
WHERE
trigger_schema = 'public'
ORDER BY
event_object_table, trigger_name;

- Change column data type

sql
ALTER TABLE table_name
ALTER COLUMN column_name TYPE new_data_type;

drop constraints

ALTER TABLE [table_name] DROP CONSTRAINT [constraint_name];

DROP TABLE IF EXISTS entity_managers;

-- For address_photos
ALTER TABLE address_photos DROP CONSTRAINT IF EXISTS fk_address_photos_address;
ALTER TABLE address_photos DROP CONSTRAINT IF EXISTS fk_address_photos_created_by;
-- Add any other constraints that might exist

-- For contact_photos
ALTER TABLE contact_photos DROP CONSTRAINT IF EXISTS fk_contact_photos_contact;
ALTER TABLE contact_photos DROP CONSTRAINT IF EXISTS fk_contact_photos_created_by;
-- Add any other constraints that might exist

-- For opportunity_photos
ALTER TABLE opportunity_photos DROP CONSTRAINT IF EXISTS fk_opportunity_photos_opportunity;
ALTER TABLE opportunity_photos DROP CONSTRAINT IF EXISTS fk_opportunity_photos_created_by;
-- Add any other constraints that might exist

-- Drop the tables
DROP TABLE IF EXISTS address_photos;
DROP TABLE IF EXISTS contact_photos;
DROP TABLE IF EXISTS opportunity_photos;

example
ALTER TABLE users
ALTER COLUMN age TYPE BIGINT;

- Rename a column

sql
ALTER TABLE table_name
RENAME COLUMN old_column_name TO new_column_name;

example
ALTER TABLE users
RENAME COLUMN full_name TO name;

- Add or Drop a NOT NULL Constraint

sql add
ALTER TABLE table_name
ALTER COLUMN column_name SET NOT NULL;

sql drop
ALTER TABLE table_name
ALTER COLUMN column_name DROP NOT NULL;

example
ALTER TABLE users
ALTER COLUMN email SET NOT NULL;

- Set or Drop a Default Value

Set Default:

sql
ALTER TABLE table_name
ALTER COLUMN column_name SET DEFAULT default_value;
Drop Default:

sql
Copy
Edit
ALTER TABLE table_name
ALTER COLUMN column_name DROP DEFAULT;
Example:

sql
Copy
Edit
ALTER TABLE users
ALTER COLUMN is_active SET DEFAULT true;

- Drop a Column

sql
ALTER TABLE table_name
DROP COLUMN column_name;
Example:

sql
ALTER TABLE users
DROP COLUMN temporary_flag;

- Find Constraints

SELECT
tc.constraint_name, -- Name of the FK constraint
tc.table_schema AS referencing_schema, -- Schema of the table with the FK
tc.table_name AS referencing_table, -- Name of the table with the FK
kcu.column_name AS referencing_column, -- Column(s) in the referencing table
ccu.table_schema AS referenced_schema, -- Schema of the PK table (should be your role_permissions schema)
ccu.table_name AS referenced_table, -- PK table name (should be 'role_permissions')
ccu.column_name AS referenced_column -- PK column name (should be 'permission_id' - the OLD name)
FROM
information_schema.table_constraints AS tc
JOIN
information_schema.key_column_usage AS kcu
ON tc.constraint_name = kcu.constraint_name
AND tc.table_schema = kcu.table_schema
JOIN
information_schema.constraint_column_usage AS ccu
ON ccu.constraint_name = tc.constraint_name
AND ccu.table_schema = tc.table_schema -- Use tc.table_schema for the constraint's schema
WHERE
tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name = 'role_permissions' -- The table with the PK you renamed
AND ccu.column_name = 'permission_id'; -- The OLD name of the PK column

- columns for table

SELECT column_name, data_type, character_maximum_length, is_nullable
FROM INFORMATION_SCHEMA.COLUMNS
WHERE table_name = 'role_settings';

-- SQL to rename a column and update any foreign key references
-- Example for renaming 'old_column_name' to 'new_column_name' in 'table_name'

-- Step 1: Identify foreign key constraints referencing this column
SELECT
tc.table_schema,
tc.constraint_name,
tc.table_name,
kcu.column_name,
ccu.table_schema AS foreign_table_schema,
ccu.table_name AS foreign_table_name,
ccu.column_name AS foreign_column_name
FROM
information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
ON tc.constraint_name = kcu.constraint_name
AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
ON ccu.constraint_name = tc.constraint_name
AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name = 'your_table_name' -- Table containing the column to be renamed
AND ccu.column_name = 'old_column_name'; -- Column to be renamed

-- Step 2: Drop all foreign key constraints found in Step 1
-- For each constraint found, run:
-- ALTER TABLE referencing_table DROP CONSTRAINT constraint_name;

-- Step 3: Rename the column
ALTER TABLE your_table_name RENAME COLUMN old_column_name TO new_column_name;

-- Step 4: Recreate the foreign key constraints
-- For each dropped constraint, run:
-- ALTER TABLE referencing_table
-- ADD CONSTRAINT constraint_name
-- FOREIGN KEY (referencing_column)
-- REFERENCES your_table_name(new_column_name);

-- Complete example for a specific case:
-- 1. First, find all foreign keys referencing column 'entity_id' in table 'entities'
-- 2. Drop each constraint (example for one):
-- ALTER TABLE entity_relationships DROP CONSTRAINT fk_entity_relationships_entity;
-- 3. Rename the column:
-- ALTER TABLE entities RENAME COLUMN entity_id TO id;
-- 4. Recreate each constraint (example for one):
-- ALTER TABLE entity_relationships
-- ADD CONSTRAINT fk_entity_relationships_entity
-- FOREIGN KEY (entity_id)
-- REFERENCES entities(id);

Professional PostgreSQL Analysis Tools

For your specific needs with normalization and propagation testing, I'd recommend starting with DBeaver (free) or Datagrip (paid) for schema analysis, combined with pgBench for performance testing of your propagation paths.

1. DBeaver

   - Comprehensive database tool with ERD visualization
   - Query analyzer for performance testing
   - Schema comparison and normalization suggestions
   - Free community edition available

2. pgAdmin 4

   - Official PostgreSQL management tool
   - Visual query plan analysis
   - Server statistics dashboard
   - Schema design and validation tools

3. Vertabelo

   - Specialized database modeling tool
   - Normalization assistance
   - Collaborative design features
   - Forward and reverse engineering

Performance Testing & Propagation Analysis

1. pgBench

   - Built-in PostgreSQL benchmarking tool
   - Custom test scripts for real workloads
   - Can measure propagation performance
   - TPS (transactions per second) measurements

2. HammerDB

   - Cross-platform database load testing
   - Industry-standard benchmarks (TPC-C, TPC-H)
   - Measures propagation between tables
   - Scales from single server to clusters

3. pg_stat_statements

   - Built-in query performance monitoring
   - Tracks execution time and resource usage
   - Identifies slow-performing joins and propagation
   - No additional installation needed

Normalization & Schema Analysis

1. Datagrip (JetBrains)

   - Smart schema visualization
   - Normalization suggestions
   - Foreign key relationship visualization
   - Query performance analysis

2. SchemaSpy

   - Generates complete database documentation
   - Identifies normalization issues
   - Visualizes table relationships
   - Detects redundant indexes

3. Metabase

   - Open-source data analytics platform
   - Query performance testing
   - Visualization of data relationships
   - Can help identify normalization issues

Specialized for Geo-spatial Testing

1. PostGIS Viewer

   - Visualizes spatial data
   - Tests spatial indexing performance
   - Validates spatial relationships

2. QGIS DB Manager

   - Connects to PostgreSQL/PostGIS
   - Visual query building and testing
   - Spatial performance analysis
