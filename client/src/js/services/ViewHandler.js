/**
 * ViewHandler.js
 * 
 * Singleton controller for the view system.
 * Manages view transitions, component loading, and routing.
 */

import ViewState from './ViewState.js';

// Define route configuration
export const ROUTES = {
  login: () => import('../pages/LoginView.js'),
  dashboard: {
    main: {
      view: () => import('../pages/SalesDashView.js'),
      map: () => import('../pages/MapView.js'),
      calendar: () => import('../pages/CalendarView.js'),
      list: () => import('../pages/ListView.js')
    }
  },
  salesboard: {
    main: {
      board: () => import('../pages/SalesBoardView.js')
    }
  },
  tracks: {
    main: {
      view: () => import('../pages/SalesTrackPage.js')
    }
  },
  zones: {
    main: {
      map: () => import('../pages/salesZonesMapView.js')
    },
    neighborhoods: {
      list: () => import('../pages/neighborhoodsListView.js')
    },
    streets: {
      list: () => import('../pages/streetsListView.js')
    }
  },
  entities: {
    contacts: {
      list: () => import('../pages/ContactsListView.js')
    }
  },
  collections: {
    main: {
      view: () => import('../pages/salesCollectionView.js')
    }
  }
};

// Special routes for auth and errors
export const SPECIAL_ROUTES = {
  login: () => import('../pages/LoginView.js'),
  notFound: () => import('../pages/NotFoundView.js'),
  error: () => import('../pages/ErrorView.js')
};

export class ViewHandler {
  static instance = null;

  constructor() {
    if (ViewHandler.instance) {
      return ViewHandler.instance;
    }
    
    ViewHandler.instance = this;
    this.viewState = ViewState;
    this.mountPoint = null;
    this.currentView = null;
    
    // Bind methods
    this.navigateTo = this.navigateTo.bind(this);
    this.loadView = this.loadView.bind(this);
    this.handlePopState = this.handlePopState.bind(this);
    
    // Handle browser back/forward
    window.addEventListener('popstate', this.handlePopState);
  }

  /**
   * Initialize the view handler
   * @param {HTMLElement} mountPoint - DOM element where views will be rendered
   */
  initialize(mountPoint) {
    this.mountPoint = mountPoint || document.getElementById('app');
    
    if (!this.mountPoint) {
      console.error('ViewHandler: No mount point found');
      return;
    }
    
    // Parse initial route from URL
    this.parseUrlAndNavigate();
  }

  /**
   * Extract route info from URL and navigate
   */
  parseUrlAndNavigate() {
    const path = window.location.pathname.replace(/^\//, '');
    const segments = path ? path.split('/') : [];
    
    if (path === '' || path === 'index.html') {
      // Default route
      this.navigateTo('dashboard', 'main', 'view');
      return;
    }
    
    if (path === 'login' || path === 'login.html') {
      this.loadSpecialRoute('login');
      return;
    }
    
    const group = segments[0] || 'dashboard';
    const tier = segments[1] || 'main';
    const view = segments[2] || 'view';
    
    this.navigateTo(group, tier, view);
  }

  /**
   * Handle browser history navigation
   * @param {PopStateEvent} event - Browser popstate event
   */
  handlePopState(event) {
    if (event.state) {
      const { group, tier, view } = event.state;
      this.navigateTo(group, tier, view, true);
    } else {
      this.parseUrlAndNavigate();
    }
  }

  /**
   * Navigate to a specific view
   * @param {string} group - View group
   * @param {string} tier - View tier
   * @param {string} view - View type
   * @param {boolean} isPopState - Whether this is from browser history
   */
  navigateTo(group, tier, view, isPopState = false) {
    // Check authentication for non-login routes
    if (group !== 'login' && !this.viewState.getState('isAuthenticated')) {
      this.loadSpecialRoute('login');
      return;
    }
    
    // Update browser history unless from popstate
    if (!isPopState) {
      const url = `/${group}/${tier}/${view}`;
      window.history.pushState({ group, tier, view }, '', url);
    }
    
    // Update view state
    this.viewState.updateState({
      currentGroup: group,
      currentTier: tier,
      currentView: view,
      loading: true
    });
    
    // Load the view
    this.loadView(group, tier, view);
  }

  /**
   * Load a view component
   * @param {string} group - View group
   * @param {string} tier - View tier
   * @param {string} viewType - View type
   */
  async loadView(group, tier, viewType) {
    try {
      // Check if route exists
      if (!ROUTES[group] || !ROUTES[group][tier] || !ROUTES[group][tier][viewType]) {
        console.error(`Route not found: ${group}/${tier}/${viewType}`);
        this.loadSpecialRoute('notFound');
        return;
      }
      
      // Import view component dynamically
      const importFunc = ROUTES[group][tier][viewType];
      const viewModule = await importFunc();
      const ViewComponent = viewModule.default;
      
      // Clear loading state
      this.viewState.updateState({ loading: false });
      
      // Create view component
      this.renderView(ViewComponent, { group, tier, viewType });
      
    } catch (error) {
      console.error('Failed to load view:', error);
      this.viewState.updateState({ 
        loading: false,
        error: error.message
      });
      this.loadSpecialRoute('error');
    }
  }

  /**
   * Load a special route (login, error, etc.)
   * @param {string} routeName - Special route name
   */
  async loadSpecialRoute(routeName) {
    try {
      const importFunc = SPECIAL_ROUTES[routeName];
      const viewModule = await importFunc();
      const ViewComponent = viewModule.default;
      
      this.renderView(ViewComponent, { isSpecialRoute: true });
      
    } catch (error) {
      console.error(`Failed to load ${routeName} route:`, error);
      // Fallback to simple error display
      this.mountPoint.innerHTML = `
        <div class="error-container">
          <h2>Something went wrong</h2>
          <p>We're having trouble loading this page.</p>
          <button onclick="window.location.reload()">Reload</button>
        </div>
      `;
    }
  }

  /**
   * Render a view component
   * @param {CustomElementConstructor} ViewComponent - View component class
   * @param {Object} props - Properties to pass to component
   */
  renderView(ViewComponent, props = {}) {
    if (!this.mountPoint) {
      console.error('ViewHandler: No mount point defined');
      return;
    }
    
    // Clear current content
    this.mountPoint.innerHTML = '';
    
    // Create new component instance
    const tagName = ViewComponent.tagName || 
                   props.tagName || 
                   `${props.group || 'app'}-${props.viewType || 'view'}`;
    
    // Handle custom element registration
    try {
      // Only define if not already defined
      if (!customElements.get(tagName)) {
        customElements.define(tagName, ViewComponent);
      }
    } catch (error) {
      console.warn(`Error registering custom element ${tagName}:`, error);
      // Fallback to a generic tag name with timestamp to avoid conflicts
      const fallbackTag = `view-element-${Date.now()}`;
      customElements.define(fallbackTag, ViewComponent);
      tagName = fallbackTag;
    }
    
    // Create element
    const viewElement = document.createElement(tagName);
    
    // Add attributes
    Object.entries(props).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        viewElement.setAttribute(key, value);
      }
    });
    
    // Set reference and append to DOM
    this.currentView = viewElement;
    this.mountPoint.appendChild(viewElement);
  }
}

// Export singleton instance
export default new ViewHandler();