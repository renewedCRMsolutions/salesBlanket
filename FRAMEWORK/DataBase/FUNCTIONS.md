# pull data for dev

https://www.metisdata.io/blog/postgresql-on-steroids-how-to-ace-your-database-configuration

SELECT generate_frontend_data_package();

-- To run just the collections function
SELECT get_collections_with_entities();

-- To run just the entity types function
SELECT get_entity_types_with_settings();

SELECT generate_frontend_data_package();

SELECT get_database_schema_details();

SELECT * FROM get_detailed_column_info();  DBqueryfordatabaseschema.csv

SELECT * FROM get_role_permissions_details();  DBrolesandpermissions.csv

SELECT * FROM get_permissions_list();  DBqueryforpermissions.csv



SELECT routine_name
FROM information_schema.routines
WHERE routine_type = 'FUNCTION'
AND routine_schema = 'public'
AND routine_name LIKE 'get_%';

"{""users"": [], ""views"": [], ""zones"": [], ""filters"": [], ""metadata"": {""version"": ""1.0"", ""generated_at"": ""2025-04-10T07:03:39.192543+00:00""}, ""collections"": [{""contacts"": null, ""addresses"": null, ""created_at"": ""2025-04-10T06:56:24.771382+00:00"", ""pulse_data"": null, ""collection_id"": ""2580ccb4-1bea-4213-8c25-bd34e5b103ec"", ""opportunities"": null, ""collection_name"": ""High-Value Opportunities in Springfield"", ""collection_status"": ""ACTIVE""}], ""entity_types"": []}"

"[{""collection_id"":""2580ccb4-1bea-4213-8c25-bd34e5b103ec"",""collection_name"":""High-Value Opportunities in Springfield"",""collection_status"":""ACTIVE"",""created_at"":""2025-04-10T06:56:24.771382+00:00"",""addresses"":null,""contacts"":null,""opportunities"":null,""pulse_data"":null}]"

"[]"

"get_collections_with_entities"
"get_entity_types_with_settings"
"get_proj4_from_srid"
"get_saved_filters"
"get_users_with_roles"
"get_views_configurations"
"get_zones_with_hierarchy"

You can call this function with:
sqlSELECT * FROM get_role_permissions_details();
If you'd like to filter by role or permission, I can also add parameters to the function:
sqlCREATE OR REPLACE FUNCTION get_role_permissions_details(
    p_role_id UUID DEFAULT NULL,
    p_permission_id UUID DEFAULT NULL
)
RETURNS TABLE (
    role_id UUID,
    permissions_id UUID,
    role_permission_created_at TIMESTAMPTZ,
    display_name VARCHAR,
    role_description TEXT,
    role_status VARCHAR,
    permission_name VARCHAR,
    permission_resource VARCHAR,
    permission_action VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id AS role_id, 
        rp.permissions_id, 
        rp.created_at AS role_permission_created_at,
        r.display_name, 
        r.description AS role_description, 
        r.status AS role_status,
        p.name AS permission_name, 
        p.resource AS permission_resource, 
        p.action AS permission_action
    FROM 
        role_permissions rp
        JOIN roles r ON rp.roles_id = r.id
        JOIN permissions p ON rp.permissions_id = p.id
    WHERE
        (p_role_id IS NULL OR r.id = p_role_id)
        AND (p_permission_id IS NULL OR p.id = p_permission_id);
END;
$$ LANGUAGE plpgsql;
With this version, you can use it like:
sql-- Get all role permissions
SELECT * FROM get_role_permissions_details();

-- Get permissions for a specific role
SELECT * FROM get_role_permissions_details(p_role_id := '12345678-1234-1234-1234-123456789012'::UUID);

-- Get roles with a specific permission
SELECT * FROM get_role_permissions_details(p_permission_id := '87654321-4321-4321-4321-210987654321'::UUID);

If you'd like to add filtering capabilities, here's an enhanced version:
sqlCREATE OR REPLACE FUNCTION get_permissions_list(
    p_resource VARCHAR DEFAULT NULL,
    p_action VARCHAR DEFAULT NULL,
    p_status VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    permission_id UUID,
    permission_name VARCHAR,
    description TEXT,
    resource VARCHAR,
    action VARCHAR,
    status VARCHAR,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        id AS permission_id,
        name AS permission_name,
        description,
        resource,
        action,
        status,
        created_at,
        updated_at
    FROM permissions
    WHERE
        (p_resource IS NULL OR resource = p_resource)
        AND (p_action IS NULL OR action = p_action)
        AND (p_status IS NULL OR status = p_status);
END;
$$ LANGUAGE plpgsql;
This version allows you to filter by resource, action, or status:
sql-- Get all permissions
SELECT * FROM get_permissions_list();

-- Get permissions for a specific resource
SELECT * FROM get_permissions_list(p_resource := 'CONTACT');

-- Get permissions with a specific action
SELECT * FROM get_permissions_list(p_action := 'READ');

-- Get permissions with a specific status
SELECT * FROM get_permissions_list(p_status := 'ACTIVE');

-- Combine filters
SELECT * FROM get_permissions_list(p_resource := 'CONTACT', p_action := 'WRITE');