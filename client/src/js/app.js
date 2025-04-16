/**
 * app.js
 * 
 * Main application entry point for SalesBlanket.
 * Initializes the application and manages component registration.
 */

import PageView from './components/PageView.js';
import ViewHandler from './services/ViewHandler.js';
import ViewState from './services/ViewState.js';

/**
 * Component Registry for centralized component registration
 */
class ComponentRegistry {
  constructor() {
    this.components = new Map();
  }

  /**
   * Register a component with the registry
   * @param {string} tagName - Custom element tag name
   * @param {CustomElementConstructor} componentClass - Component class
   */
  register(tagName, componentClass) {
    if (this.components.has(tagName)) {
      console.warn(`Component ${tagName} already registered`);
      return;
    }
    
    this.components.set(tagName, componentClass);
    
    // Register with browser if not already registered
    if (!customElements.get(tagName)) {
      customElements.define(tagName, componentClass);
    }
  }

  /**
   * Check if a component is registered
   * @param {string} tagName - Custom element tag name
   * @returns {boolean} Whether component is registered
   */
  isRegistered(tagName) {
    return this.components.has(tagName);
  }

  /**
   * Get a registered component class
   * @param {string} tagName - Custom element tag name
   * @returns {CustomElementConstructor|null} Component class or null
   */
  getComponent(tagName) {
    return this.components.get(tagName) || null;
  }
}

/**
 * Application class for initializing and managing the SalesBlanket app
 */
class SalesBlanketApp {
  constructor() {
    this.componentRegistry = new ComponentRegistry();
    this.viewHandler = ViewHandler;
    this.viewState = ViewState;
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.registerComponents = this.registerComponents.bind(this);
  }

  /**
   * Initialize the application
   */
  initialize() {
    console.log('SalesBlanket v4 initializing...');
    
    // Register components
    this.registerComponents();
    
    // Create main application container
    const appContainer = document.getElementById('app');
    if (!appContainer) {
      const container = document.createElement('div');
      container.id = 'app';
      document.body.appendChild(container);
    }
    
    // Create and mount the PageView
    const pageView = document.createElement('page-view');
    document.getElementById('app').appendChild(pageView);
    
    // Initialize ViewHandler with simulated authentication
    this.viewState.updateState({
      isAuthenticated: true,
      user: {
        id: 1,
        name: 'Demo User',
        email: 'demo@example.com',
        roles: ['sales_rep']
      }
    });
    
    // Set initial route
    setTimeout(() => {
      this.viewHandler.navigateTo('dashboard', 'main', 'view');
    }, 0);
    
    console.log('SalesBlanket v4 initialized');
  }

  /**
   * Register all application components
   */
  registerComponents() {
    // Core Components
    this.componentRegistry.register('page-view', PageView);
    
    // Load other components dynamically as needed
    // The ViewHandler will handle dynamic imports
  }
}

// Create and initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new SalesBlanketApp();
  app.initialize();
});

// Expose app to window for debugging
window.salesBlanketApp = new SalesBlanketApp();