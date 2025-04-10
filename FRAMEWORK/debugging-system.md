# SalesBlanket Debugging System

This document describes the debug system implementation for SalesBlanket, allowing for non-invasive debug monitoring of services.

## Overview

The SalesBlanket debug system uses JavaScript Proxies to intercept service method calls, providing insights into data flow and error conditions without modifying service code. The system enables:

- On-demand debugging of specific services
- Method call tracking with arguments and results
- Promise response monitoring
- Error logging
- Per-route enablement controls

## Architecture

The debug system consists of these components:

1. **ServiceProxy**: Creates proxy wrappers around service objects
2. **DebugProxy**: Central registry of proxied services 
3. **DebugService**: Core debug functionality and state management
4. **DebugController**: User interface for controlling debug settings

## Implementation

### Files Structure

1. **Existing Files**:
   - `src/components/debug/DebugController.js`
   - `src/services/DebugService.js`
   - HTML injection in `index.html`

2. **New Files to Create**:
   - `src/debug/ServiceProxy.js`
   - `src/debug/DebugProxy.js`

3. **Files to Modify**:
   - Add methods to `src/services/DebugService.js`
   - Update UI in `src/components/debug/DebugController.js`
   - Initialize debugging in `src/main.js`

### Implementation Details

#### ServiceProxy.js

Creates a proxy that intercepts service method calls:

```javascript
// src/debug/ServiceProxy.js
import debugService from '../services/DebugService.js';

export function createServiceProxy(service, moduleName) {
  // Create a proxy that wraps all methods of the service
  return new Proxy(service, {
    // Intercept method calls
    get(target, prop, receiver) {
      const original = target[prop];

      // Only proxy methods, not properties
      if (typeof original === 'function') {
        return function(...args) {
          // Check if debugging is enabled for this module
          if (!debugService.enabled || !debugService.modules[moduleName]) {
            return original.apply(this, args);
          }

          // Log method call
          debugService.log(moduleName, `${prop}() called`, { args });

          try {
            // Call the original method
            const result = original.apply(this, args);

            // Handle Promises specially
            if (result instanceof Promise) {
              return result.then(data => {
                debugService.log(moduleName, `${prop}() completed`, { data });
                return data;
              }).catch(error => {
                debugService.error(moduleName, `${prop}() failed`, { error });
                throw error;
              });
            }

            // Log and return regular results
            debugService.log(moduleName, `${prop}() completed`, { result });
            return result;
          } catch (error) {
            debugService.error(moduleName, `${prop}() failed`, { error });
            throw error;
          }
        };
      }

      // Return non-function properties as-is
      return original;
    }
  });
}
```

#### DebugProxy.js

Creates and registers proxied versions of services:

```javascript
// src/debug/DebugProxy.js
import { createServiceProxy } from './ServiceProxy.js';
import entityService from '../services/EntityService.js';
import salesBoardService from '../services/SalesBoardService.js';
import userSettingsService from '../services/UserSettingsService.js';
import debugService from '../services/DebugService.js';

// Create proxied services
export const debugEntityService = createServiceProxy(entityService, 'EntityService');
export const debugSalesBoardService = createServiceProxy(salesBoardService, 'SalesBoardService');
export const debugUserSettingsService = createServiceProxy(userSettingsService, 'UserSettingsService');

// Register services with debug controller
export function registerDebugServices() {
  window.debugServices = {
    EntityService: {
      service: debugEntityService,
      original: entityService
    },
    SalesBoardService: {
      service: debugSalesBoardService,
      original: salesBoardService
    },
    UserSettingsService: {
      service: debugUserSettingsService,
      original: userSettingsService
    }
  };
}

// Initialize debugging system
export function initializeDebugging() {
  registerDebugServices();

  // Enable services based on stored settings
  try {
    const enabled = localStorage.getItem('debug_enabled');
    const modules = localStorage.getItem('debug_modules');

    if (enabled) debugService.enabled = JSON.parse(enabled);
    if (modules) debugService.modules = JSON.parse(modules);
  } catch (e) {
    console.error('Error loading debug settings:', e);
  }
}
```

#### Add to DebugService.js

Add route-specific control methods:

```javascript
// Add this method to your DebugService class
enableRoute(serviceName, methodName, enabled = true) {
  // Make sure modules object for this service exists
  if (!this.modules[serviceName]) {
    this.modules[serviceName] = {};
  }

  // Set route status
  if (!this.routeStatuses) {
    this.routeStatuses = {};
  }

  if (!this.routeStatuses[serviceName]) {
    this.routeStatuses[serviceName] = {};
  }

  this.routeStatuses[serviceName][methodName] = enabled;
  this._saveSettings();

  this.log('DebugService', `Route ${serviceName}.${methodName} ${enabled ? 'enabled' : 'disabled'}`);
  return this;
}

// Add this to your existing _saveSettings method
_saveSettings() {
  try {
    localStorage.setItem('debug_enabled', JSON.stringify(this.enabled));
    localStorage.setItem('debug_modules', JSON.stringify(this.modules));
    localStorage.setItem('debug_routes', JSON.stringify(this.routeStatuses || {}));
  } catch (e) {}
}

// Add this to your existing _loadSettings method
_loadSettings() {
  try {
    const enabled = localStorage.getItem('debug_enabled');
    const modules = localStorage.getItem('debug_modules');
    const routes = localStorage.getItem('debug_routes');

    if (enabled) this.enabled = JSON.parse(enabled);
    if (modules) this.modules = JSON.parse(modules);
    if (routes) this.routeStatuses = JSON.parse(routes);
  } catch (e) {}
}
```

#### Add to DebugController.js

Add UI for route toggling:

```javascript
// Add this to your render method, inside the debug panel
_renderRouteToggles(moduleName) {
  if (!this.debugService.routeStatuses || !this.debugService.routeStatuses[moduleName]) {
    return '<p>No routes configured</p>';
  }

  const routes = this.debugService.routeStatuses[moduleName];
  return Object.keys(routes).map(route => {
    const enabled = routes[route];
    return `
      <div class="route-toggle">
        <span>${route}</span>
        <input type="checkbox" data-module="${moduleName}" data-route="${route}" ${enabled ? 'checked' : ''}>
      </div>
    `;
  }).join('');
}

// Add this to your addEventListeners method
const routeToggles = this.shadowRoot.querySelectorAll('input[data-route]');
routeToggles.forEach(toggle => {
  toggle.addEventListener('change', (e) => {
    const module = e.target.dataset.module;
    const route = e.target.dataset.route;
    this.debugService.enableRoute(module, route, e.target.checked);
  });
});
```

#### Update main.js

Initialize debugging:

```javascript
// Add near the top of the imports
import { initializeDebugging } from './debug/DebugProxy.js';

// Add after App class definition but before the init() call
// Initialize debugging system
initializeDebugging();
```

## Using the Debug System

To use the debuggable versions of services in a component:

```javascript
// Example usage in a component
import { debugEntityService } from '../../debug/DebugProxy.js';

class MyComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    // Use debuggable service instead of regular one
    this.entityService = debugEntityService;
  }

  async connectedCallback() {
    // This call will be logged when EntityService debugging is enabled
    const data = await this.entityService.getEntityTypes();
    // ...
  }
}
```

## Implementation Steps

1. Create the new files as detailed above
2. Modify your existing DebugService and DebugController
3. Update main.js to initialize debugging
4. In components you want to debug, import and use the debug-proxied services

Your debug UI will continue working as before, but now it will control the proxy layer instead of requiring changes to your actual service implementations.