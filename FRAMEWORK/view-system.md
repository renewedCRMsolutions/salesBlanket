# SalesBlanket View System Architecture

## Overview

The SalesBlanket view system follows a modular, component-based architecture using Web Components with a singleton service pattern. This document outlines the core architecture, component relationships, and state management flow of the view system.

## Architectural Pattern

The view system implements a **hierarchical MVC (Model-View-Controller)** pattern with **singleton services** for shared functionality. The architecture consists of:

1. **View Components**: Web Components for UI rendering
2. **Controllers**: Managing view logic and coordination
3. **Services**: Singleton services for shared state and operations
4. **State Management**: Centralized view state with events for updates

## Core Components

### ViewHandler (Singleton)

`ViewHandler` is the primary controller for the view system, implemented as a singleton:

```javascript
class ViewHandler {
  static instance = null;

  constructor() {
    if (ViewHandler.instance) return ViewHandler.instance;
    ViewHandler.instance = this;
    // ...
  }
  // ...
}
```

Key responsibilities:

- Managing view transitions
- Dynamic component loading
- Route handling
- Context management

### ViewState (Singleton)

`ViewState` maintains the current application view state:

```javascript
export class ViewState {
  static instance = null;

  constructor() {
    if (ViewState.instance) return ViewState.instance;
    ViewState.instance = this;
    this.state = state;
  }
  // ...
}
```

The state includes:

- Current group/tier/view
- Previous state (for navigation history)
- View configuration (filter and sidebar components)

### BaseView (Component Base Class)

`BaseView` is the foundation component that all view components extend:

```javascript
export class BaseView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._state = {};
    // ...
  }
  // ...
}
```

Provides:

- Standard lifecycle methods
- State management at the component level
- Common rendering and event handling

### PageView (Container Component)

`PageView` serves as the container for the current view:

```javascript
export default class PageView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // ...
  }
  // ...
}
```

Acts as:

- Layout container
- Slot for dynamic view components
- Event handler for layout changes

## State Management

### Central State Store

The state management approach is centralized in the `ViewHandler`, with the actual state exported as an object:

```javascript
export const state = {
  currentGroup: null,
  currentTier: null,
  currentView: null,
  previousState: {
    /* ... */
  },
  viewConfig: {
    /* ... */
  },
  isAuthenticated: false,
  user: null,
};
```

### State Updates and Events

State changes follow a unidirectional flow:

1. State update through `ViewState.updateState()`
2. Event dispatching via custom events
3. Component rerendering in response to events

Example flow:

```javascript
// Update state
this.viewState.updateState({ currentView: newView });

// Dispatch event
this.dispatchViewChange();

// Render new view
this.renderView(newView);
```

## Routing and Navigation

### Configuration-Based Routing

Routes are configured in `ROUTES` and `SPECIAL_ROUTES` objects:

```javascript
export const ROUTES = {
  login: () => import('../auth/LoginView.js'),
  GroupA: {
    T1: {
      map: async () => {
        /* ... */
      },
      // ...
    },
  },
  // Other groups...
};
```

### Dynamic Loading

Views are dynamically loaded based on group/tier/view:

```javascript
async loadViewComponent(group, tier, viewType) {
    const module = await import(`../../groups/${group}/tiers/${tier}/views/${viewType}.js`);
    return module.default;
}
```

## Component Registration and Rendering

### Component Registration

Components are automatically registered through a component registry:

```javascript
try {
  ComponentRegistry.register(tagName, ViewComponentClass);
} catch (error) {
  console.log(`[ViewHandler] Component ${tagName} already registered:`, error);
}
```

### Dynamic Component Creation

Views are dynamically created and added to the DOM:

```javascript
const element = document.createElement(tagName);
element.setAttribute('group', state.currentGroup);
element.setAttribute('tier', state.currentTier);
element.setAttribute('view-type', viewType);
pageView.appendChild(element);
```

## Services Integration

### Service Singletons

Services follow the singleton pattern for consistent state:

```javascript
class SidebarService {
  constructor() {
    if (SidebarService.instance) return SidebarService.instance;
    SidebarService.instance = this;
    // ...
  }
  // ...
}

export default new SidebarService();
```

### Service Dependencies

View components use services through direct imports:

```javascript
import SidebarService from '../../services/SidebarService.js';

class MyView extends BaseView {
  constructor() {
    super();
    this.sidebarService = SidebarService;
    // ...
  }
  // ...
}
```

## View Hierarchies and Organization

The view system organizes views hierarchically:

1. **Groups**: Main application areas (GroupA, GroupB, etc.)
2. **Tiers**: Subgroups within each area (T1, T2, T3, T4, etc.)
3. **Views**: Specific view types (map, sheet, hybrid, etc.)

This structure is reflected in both the configuration and the file organization:

```
/groups
  /groupa
    /tiers
      /t1
        /views
          GroupA_T1_View1A.js
          GroupA_T1_View2A.js
          GroupA_T1_View3A.js
      /t2
        /views
          ...
  /groupb
    /boards
      /b1
        /views
          ...
```

## Enhanced Database-Driven View System

To increase flexibility and configuration options, the view system should evolve to be database-driven rather than hardcoded.

### Database Schema for Views

#### 1. view_types
- id (PK)
- name (map_view, sheet_view, hybrid_view, calendar_view)
- component_path (for dynamic loading)
- icon
- description
- default_config (JSON)

#### 2. view_configurations
- id (PK)
- view_type_id (FK)
- name
- config (JSON for layout, columns, filters)
- is_system (boolean)
- is_default (boolean)

#### 3. group_views
- id (PK) 
- group_id (FK)
- view_configuration_id (FK)
- entity_type_id (FK)
- order_index (for display order)
- is_default (boolean)

#### 4. user_view_preferences
- id (PK)
- user_id (FK)
- view_configuration_id (FK)
- is_favorite (boolean)
- custom_settings (JSON)

## Google Zones Integration

For geographic data management, the system will leverage Google's geographic boundaries while maintaining custom sales territories.

### Geographic Zone Tables

#### 1. geographic_zones
- id (PK)
- parent_id (FK, self-referential)
- name
- level (1=region, 2=territory, 3=district, 4=neighborhood)
- boundary (PostGIS geometry)
- google_place_id (for linking to Google Places)
- place_type (country, administrative_area_1, locality, etc.)
- metadata (JSON)

#### 2. zone_hierarchies
- parent_zone_id (FK)
- child_zone_id (FK)
- relationship_type (contains, overlaps)

#### 3. entity_zones
- entity_id (FK)
- entity_type_id (FK)
- zone_id (FK)
- assignment_type (primary, secondary)

## Document AI Integration - magicBlanket

To implement intelligent document processing capabilities, the following structure supports the "magicBlanket" feature:

### Document System Tables

#### 1. document_types
- id (PK)
- name (invoice, contract, proposal, etc.)
- processor_id (Vertex AI processor ID)
- extraction_schema (JSON defining expected fields)

#### 2. documents
- id (PK)
- document_type_id (FK)
- title
- file_path
- upload_date
- status (processing, completed, error)
- entity_id (related entity)
- entity_type_id (related entity type)
- metadata (JSON)

#### 3. document_data
- id (PK)
- document_id (FK)
- field_name
- field_value
- confidence_score
- source_coordinates (JSON)

#### 4. document_ai_models
- id (PK)
- name
- version
- endpoint_url
- api_key_reference
- model_type (extraction, classification, etc)
- status (training, active)

## GraphQL Implementation

The system implements GraphQL for efficient, type-safe data fetching with TypeScript integration. This provides:

1. Dynamic view configuration loading
2. Hierarchical data fetching for geographic zones
3. Entity relationship traversal
4. Document processing status and results querying

The combination of database-driven views, geographic zones, and AI-powered document processing creates a flexible, configurable, and intelligent sales platform.

## Strengths and Considerations

### Strengths

1. **Modularity**: Clear separation of components and responsibilities
2. **Singleton Services**: Consistent service instances throughout the application
3. **Dynamic Loading**: Efficient loading of only needed components
4. **Standardized Components**: BaseView provides consistent behavior
5. **Flexible Configuration**: Route and view definitions are configuration-driven
6. **Database-Driven Views**: Allows for runtime configuration without code changes
7. **AI Integration**: Document processing enhances data capabilities

### Considerations

1. **Error Handling**: Comprehensive error handling for dynamic imports is critical 
2. **Testing Isolation**: Singletons can make isolated testing more complex 
3. **State Synchronization**: Multiple sources of truth need careful synchronization
4. **Database Schema Evolution**: Supporting schema changes while maintaining backward compatibility

## Future Enhancement Opportunities

1. **Service Registry**: Centralized registry for all service singletons
2. **Dependency Injection**: Explicit dependency declaration for better testability
3. **View Caching**: Caching strategies for frequently used views
4. **Lazy Loading Optimization**: More granular control over component loading
5. **State Management Library**: Consider more formal state management patterns
6. **AI-Powered Insights**: Expand document AI capabilities to provide sales intelligence
7. **Predictive Territory Management**: Use geographic data for territory optimization

## Conclusion

The SalesBlanket view system effectively implements a singleton service pattern within a component-based architecture. The proposed enhancements with database-driven views, Google Zones integration, and document AI create a powerful, flexible platform that can adapt to changing business needs while providing advanced capabilities for sales teams.