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

## Event Handling

### Custom Events

Communication between components uses custom events:

```javascript
document.dispatchEvent(
  new CustomEvent('viewContextChanged', {
    detail: {
      group: state.currentGroup,
      tier: state.currentTier,
      // ...
    },
    bubbles: true,
  })
);
```

### Event Listeners

Components and services listen for events:

```javascript
document.addEventListener('viewContextChanged', (e) => {
  this.handleViewChange(e.detail);
});
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

## Strengths and Considerations

### Strengths

1. **Modularity**: Clear separation of components and responsibilities
2. **Singleton Services**: Consistent service instances throughout the application
3. **Dynamic Loading**: Efficient loading of only needed components
4. **Standardized Components**: BaseView provides consistent behavior
5. **Flexible Configuration**: Route and view definitions are configuration-driven

### Considerations

the con 2. **Error Handling**: Comprehensive error handling for dynamic imports is critical 3. **Testing Isolation**: Singletons can make isolated testing more complex 4. **State Synchronization**: Multiple sources of truth need careful synchronization

## Future Enhancement Opportunities

1. **Service Registry**: Centralized registry for all service singletons
2. **Dependency Injection**: Explicit dependency declaration for better testability
3. **View Caching**: Caching strategies for frequently used views
4. **Lazy Loading Optimization**: More granular control over component loading
5. **State Management Library**: Consider more formal state management patterns

## Conclusion

The SalesBlanket view system effectively implements a singleton service pattern within a component-based architecture. The system provides a flexible, modular approach to view management with centralized state and consistent service instances across the application. The combination of Web Components with singleton services creates a scalable architecture that supports the application's complex view requirements.
