# SalesBlanket v4 View System

## Overview

The SalesBlanket v4 View System is a flexible, database-driven configuration system that defines how different types of data are displayed in the application. This replaces traditional hardcoded components with a dynamic, configurable approach.

## Core Concepts

### ViewType

A `ViewType` defines a basic view pattern (map, list, grid, etc.) with metadata:

- `id`: Unique identifier
- `name`: Display name
- `componentPath`: Path to the React component that renders this view type
- `icon`: Icon to represent this view type
- `description`: Human-readable description
- `defaultConfig`: Default configuration for this view type

### ViewConfiguration

A `ViewConfiguration` is a specific implementation of a ViewType with custom settings:

- `id`: Unique identifier
- `viewTypeId`: Reference to the ViewType
- `name`: Name of this specific configuration
- `config`: JSON configuration object that controls rendering
- `isSystem`: Whether this is a system-defined configuration
- `isDefault`: Whether this is the default configuration for its type

### UserViewPreference

A `UserViewPreference` stores user-specific overrides for view configurations:

- `id`: Unique identifier
- `userId`: Reference to the user
- `viewConfigurationId`: Reference to the view configuration
- `isFavorite`: Whether the user has marked this as a favorite
- `customSettings`: User-specific overrides for the configuration

## Component Resolution System

1. **Dynamic Component Loading**

The frontend uses a component registry to resolve component paths:

```typescript
// Component registry
const componentRegistry = {
  'views/map': MapView,
  'views/list': ListView,
  'views/grid': GridView,
  'views/hybrid': HybridView,
  // etc.
};

// Component resolver
function resolveComponent(componentPath: string) {
  const Component = componentRegistry[componentPath];
  if (!Component) {
    console.error(`Component not found: ${componentPath}`);
    return FallbackComponent;
  }
  return Component;
}
```

2. **View Renderer**

The ViewRenderer component handles dynamic rendering:

```typescript
function ViewRenderer({ 
  viewConfigurationId, 
  entityTypeId,
  data,
  ...props 
}: ViewRendererProps) {
  // Fetch view configuration from cache or API
  const { data: viewConfig } = useQuery(GET_VIEW_CONFIGURATION, {
    variables: { id: viewConfigurationId }
  });
  
  // Get user preferences if available
  const { data: userPrefs } = useQuery(GET_USER_VIEW_PREFERENCES, {
    variables: { viewConfigurationId }
  });
  
  // Merge configurations
  const mergedConfig = useMemo(() => {
    return {
      ...viewConfig?.defaultConfig,
      ...viewConfig?.config,
      ...userPrefs?.customSettings
    };
  }, [viewConfig, userPrefs]);
  
  // Resolve the component
  const ViewComponent = resolveComponent(viewConfig?.viewType?.componentPath);
  
  return (
    <ViewComponent
      config={mergedConfig}
      data={data}
      {...props}
    />
  );
}
```

## View Type Examples

### MapView

A map-based view utilizing Google Maps:

```json
{
  "id": "map-view-default",
  "viewTypeId": "map",
  "name": "Default Map View",
  "config": {
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
  },
  "isSystem": true,
  "isDefault": true
}
```

### ListView

A list-based view for displaying entities:

```json
{
  "id": "list-view-compact",
  "viewTypeId": "list",
  "name": "Compact List View",
  "config": {
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
  },
  "isSystem": true,
  "isDefault": false
}
```

## Database Schema

The database schema follows the structure defined in the GraphQL schema:

```sql
CREATE TABLE view_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  component_path VARCHAR(255) NOT NULL,
  icon VARCHAR(255),
  description TEXT,
  default_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE view_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  view_type_id UUID NOT NULL REFERENCES view_types(id),
  name VARCHAR(255) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE user_view_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  view_configuration_id UUID NOT NULL REFERENCES view_configurations(id),
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  custom_settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, view_configuration_id)
);
```

## API Access

The view system is accessible through GraphQL queries and mutations:

```graphql
# Queries
query ViewTypes {
  viewTypes {
    id
    name
    componentPath
    icon
    description
    defaultConfig
  }
}

query ViewConfigurations($filter: ViewConfigFilter) {
  viewConfigurations(filter: $filter) {
    id
    name
    config
    isSystem
    isDefault
    viewType {
      id
      name
      componentPath
    }
  }
}

query UserViewPreferences($userId: UUID!) {
  userViewPreferences(userId: $userId) {
    id
    isFavorite
    customSettings
    viewConfiguration {
      id
      name
      viewType {
        componentPath
      }
    }
  }
}

# Mutations
mutation CreateViewConfiguration($input: CreateViewConfigInput!) {
  createViewConfiguration(input: $input) {
    id
    name
    config
  }
}

mutation SaveUserViewPreference($input: SaveUserViewPreferenceInput!) {
  saveUserViewPreference(input: $input) {
    id
    isFavorite
    customSettings
  }
}
```

## Client Implementation

The client application uses the Apollo Client to retrieve view configurations and render the appropriate components:

```typescript
function EntityViewPage({ entityTypeId, viewId }) {
  const { data, loading, error } = useQuery(GET_ENTITY_VIEW, {
    variables: { entityTypeId, viewId }
  });
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  const { viewConfiguration, entities } = data;
  
  return (
    <ViewRenderer
      viewConfigurationId={viewConfiguration.id}
      entityTypeId={entityTypeId}
      data={entities}
    />
  );
}
```

## Best Practices

1. **Component Design**:
   - Build view components to accept a standardized configuration structure
   - Use prop validation to catch configuration errors early
   - Implement sensible defaults for all configuration options

2. **Performance**:
   - Cache view configurations for performance
   - Use memoization to prevent unnecessary re-renders
   - Implement virtualization for large data sets

3. **Extensibility**:
   - Design components to be easily extended
   - Document the configuration schema for each view type
   - Provide helper functions for common configuration patterns

4. **Security**:
   - Validate all configuration JSON against schemas
   - Restrict view configuration creation/editing to authorized users
   - Sanitize user-provided configuration data

## Google Zones Integration

The View System integrates with Google Zones through:

1. **Map Views**: Display zones as polygons on Google Maps
2. **Zone Selection**: UI components for selecting and filtering by zone
3. **Spatial Queries**: Components that visualize spatial query results