-- Seed data for SalesBlanket v4

-- Default user for development
INSERT INTO users (
  id, username, email, password_hash, first_name, last_name, status, created_at, updated_at
) VALUES (
  uuid_generate_v4(),
  'admin',
  'admin@example.com',
  -- Password is 'password123'
  '$2b$10$rMZ9Ub8cFQY.yQ0MoaQcLeU5.EG4D/9D3RZhB0guLQiMHiyCc23J.',
  'Admin',
  'User',
  'ACTIVE',
  NOW(),
  NOW()
);

-- Entity Types
INSERT INTO entity_types (id, display_name, parent_category, is_filterable, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Address', NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Contact', NULL, true, NOW(), NOW()),
  (uuid_generate_v4(), 'Opportunity', NULL, true, NOW(), NOW());

-- Zone Types
INSERT INTO zone_types (
  id, display_name, level_order, description, icon, default_color,
  default_opacity, default_line_width, allow_boundary_crossing, created_at, updated_at
)
VALUES
  (uuid_generate_v4(), 'Country', 1, 'Country-level zone', 'globe', '#3388FF', 0.2, 2, false, NOW(), NOW()),
  (uuid_generate_v4(), 'State', 2, 'State/province level zone', 'map', '#33FF88', 0.3, 2, false, NOW(), NOW()),
  (uuid_generate_v4(), 'City', 3, 'City-level zone', 'building', '#FF8833', 0.4, 2, false, NOW(), NOW()),
  (uuid_generate_v4(), 'Neighborhood', 4, 'Neighborhood-level zone', 'home', '#8833FF', 0.5, 2, false, NOW(), NOW()),
  (uuid_generate_v4(), 'SalesTerritory', 5, 'Sales territory zone', 'user-tie', '#FF3388', 0.6, 3, true, NOW(), NOW());

-- View Types
INSERT INTO view_types (id, name, component_path, icon, description, default_config, created_at, updated_at)
VALUES
  (
    uuid_generate_v4(),
    'Map View',
    'views/map',
    'map-marker-alt',
    'Displays entities on a map',
    '{
      "mapOptions": {
        "initialZoom": 10,
        "centerLat": 37.7749,
        "centerLng": -122.4194,
        "mapTypeId": "roadmap"
      },
      "markerOptions": {
        "clustered": true,
        "showLabels": true
      },
      "layerControls": {
        "showZones": true,
        "showAddresses": true,
        "showTeams": true
      }
    }',
    NOW(),
    NOW()
  ),
  (
    uuid_generate_v4(),
    'List View',
    'views/list',
    'list',
    'Displays entities in a list format',
    '{
      "columns": [
        { "field": "name", "header": "Name", "sortable": true },
        { "field": "status", "header": "Status", "filterable": true },
        { "field": "updatedAt", "header": "Last Updated", "type": "date" }
      ],
      "pagination": {
        "pageSize": 25,
        "pageSizeOptions": [10, 25, 50, 100]
      },
      "actions": {
        "edit": true,
        "delete": true,
        "details": true
      }
    }',
    NOW(),
    NOW()
  ),
  (
    uuid_generate_v4(),
    'Grid View',
    'views/grid',
    'th',
    'Displays entities in a grid format',
    '{
      "gridOptions": {
        "columnsPerRow": 3,
        "cardHeight": 200
      },
      "cardOptions": {
        "showHeader": true,
        "showFooter": true,
        "showImage": true
      }
    }',
    NOW(),
    NOW()
  ),
  (
    uuid_generate_v4(),
    'Hybrid View',
    'views/hybrid',
    'columns',
    'Displays map and list side by side',
    '{
      "layout": "split",
      "leftView": {
        "type": "map",
        "width": "50%",
        "options": {
          "initialZoom": 10,
          "mapTypeId": "roadmap"
        }
      },
      "rightView": {
        "type": "list",
        "width": "50%",
        "options": {
          "pageSize": 10
        }
      }
    }',
    NOW(),
    NOW()
  );