/**
 * PageView.js
 * 
 * Main container component for the application layout.
 * Organizes the header, navigation, sidebar, and content areas.
 */

import { BaseView } from './BaseView.js';
import ViewState from '../services/ViewState.js';
import ViewHandler from '../services/ViewHandler.js';

export class PageView extends BaseView {
  constructor() {
    super();
    this.viewState = ViewState;
    this.viewHandler = ViewHandler;
    
    // Bind methods
    this.handleNavigation = this.handleNavigation.bind(this);
    this.handleViewStateChange = this.handleViewStateChange.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      currentView: null,
      user: this.viewState.getState('user'),
      isAuthenticated: this.viewState.getState('isAuthenticated')
    };
    
    // Subscribe to view state changes
    this.unsubscribe = this.viewState.subscribe(this.handleViewStateChange);
  }

  /**
   * Handle view state changes
   * @param {Object} event - State change event
   */
  handleViewStateChange({ currentState }) {
    this.setState({
      currentView: {
        group: currentState.currentGroup,
        tier: currentState.currentTier,
        viewType: currentState.currentView
      },
      user: currentState.user,
      isAuthenticated: currentState.isAuthenticated,
      loading: currentState.loading
    });
  }

  /**
   * Handle navigation clicks
   * @param {Event} event - Click event
   */
  handleNavigation(event) {
    const navItem = event.target.closest('[data-nav]');
    if (!navItem) return;
    
    const { group, tier, view } = navItem.dataset;
    if (group && tier && view) {
      event.preventDefault();
      this.viewHandler.navigateTo(group, tier, view);
      
      // Update active state in navigation
      this.updateActiveNavigation(group, tier, view);
    }
  }

  /**
   * Update active state in navigation
   * @param {string} group - Active group
   * @param {string} tier - Active tier
   * @param {string} view - Active view
   */
  updateActiveNavigation(group, tier, view) {
    const navItems = this.shadowRoot.querySelectorAll('[data-nav]');
    navItems.forEach(item => {
      if (
        item.dataset.group === group &&
        item.dataset.tier === tier &&
        item.dataset.view === view
      ) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    const nav = this.shadowRoot.querySelector('nav');
    if (nav) {
      this.addTrackedEventListener('click', this.handleNavigation, {}, nav);
    }
    
    // Listen for navigation events from child components
    this.addTrackedEventListener('navigation', (event) => {
      const { group, tier, view } = event.detail;
      this.viewHandler.navigateTo(group, tier, view);
    }, { bubbles: true, composed: true }, window);
  }

  /**
   * Define component styles
   * @returns {string} Component CSS
   */
  getStyles() {
    return `
      ${super.getStyles()}
      
      :host {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100%;
        overflow: hidden;
      }
      
      .app-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }
      
      header {
        background-color: #2F4F2F; /* Brewster Green */
        color: white;
        padding: 0.5rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 60px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .logo {
        font-size: 1.5rem;
        font-weight: bold;
        display: flex;
        align-items: center;
      }
      
      .version {
        font-size: 0.7rem;
        margin-left: 0.5rem;
        opacity: 0.7;
      }
      
      .header-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      
      .search-box {
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        border: none;
        min-width: 250px;
      }
      
      .user-controls {
        display: flex;
        align-items: center;
        gap: 0.8rem;
      }
      
      nav {
        background-color: #1A3A59; /* Golf Blau */
        display: flex;
        padding: 0.5rem;
        overflow-x: auto;
        white-space: nowrap;
      }
      
      nav a {
        color: white;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        transition: background-color 0.2s;
      }
      
      nav a:hover {
        background-color: rgba(255,255,255,0.1);
      }
      
      nav a.active {
        background-color: rgba(255,255,255,0.2);
        font-weight: bold;
      }
      
      main {
        flex: 1;
        overflow: auto;
        position: relative;
        background-color: #f5f5f5;
      }
      
      .content-area {
        height: 100%;
        position: relative;
      }
      
      footer {
        background-color: #4B5358; /* Agate Grey */
        color: white;
        padding: 0.5rem;
        font-size: 0.8rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .footer-actions {
        display: flex;
        gap: 1rem;
      }
      
      .footer-action {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        color: white;
        text-decoration: none;
        padding: 0.3rem 0.6rem;
        border-radius: 4px;
        background-color: rgba(0,0,0,0.2);
      }
      
      .loading-indicator {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background-color: #FFC20E; /* Racing Yellow */
        z-index: 1000;
        transform: scaleX(0);
        transform-origin: left;
        animation: loading 2s infinite ease-in-out;
      }
      
      @keyframes loading {
        0% { transform: scaleX(0); }
        50% { transform: scaleX(0.7); }
        100% { transform: scaleX(0); transform-origin: right; }
      }
      
      .login-button {
        background-color: #9CCB19; /* Lime Green */
        color: #1A3A59;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
      }
      
      .add-button {
        background-color: #9CCB19; /* Lime Green */
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        font-weight: bold;
        cursor: pointer;
      }
    `;
  }

  /**
   * Render component template
   */
  render() {
    const { user, isAuthenticated, currentView, loading } = this.getState();
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    const container = this.createElement('div', { class: 'app-container' }, [
      // Header
      this.createElement('header', {}, [
        this.createElement('div', { class: 'logo' }, [
          'SalesBlanket',
          this.createElement('span', { class: 'version' }, 'v4')
        ]),
        this.createElement('div', { class: 'header-controls' }, [
          this.createElement('button', { class: 'add-button' }, [
            '+ Add Record'
          ]),
          this.createElement('input', {
            type: 'text',
            class: 'search-box',
            placeholder: 'Search addresses...'
          }),
          this.createElement('div', { class: 'user-controls' }, [
            isAuthenticated
              ? [
                  this.createElement('span', {}, user?.name || 'User'),
                  this.createElement('button', { class: 'login-button' }, 'Logout')
                ]
              : this.createElement('button', { class: 'login-button' }, 'Login')
          ])
        ])
      ]),
      
      // Navigation
      this.createElement('nav', {}, [
        this.createElement('a', {
          'data-nav': '',
          'data-group': 'dashboard',
          'data-tier': 'main', 
          'data-view': 'map',
          class: currentView?.group === 'dashboard' && currentView?.viewType === 'map' ? 'active' : ''
        }, 'Regions'),
        this.createElement('a', {
          'data-nav': '',
          'data-group': 'entities',
          'data-tier': 'territories', 
          'data-view': 'map',
          class: currentView?.tier === 'territories' ? 'active' : ''
        }, 'Territories'),
        this.createElement('a', {
          'data-nav': '',
          'data-group': 'entities',
          'data-tier': 'districts', 
          'data-view': 'map',
          class: currentView?.tier === 'districts' ? 'active' : ''
        }, 'Districts'),
        this.createElement('a', {
          'data-nav': '',
          'data-group': 'entities',
          'data-tier': 'addresses', 
          'data-view': 'map',
          class: currentView?.tier === 'addresses' ? 'active' : ''
        }, 'Addresses'),
        this.createElement('a', {
          'data-nav': '',
          'data-group': 'dashboard',
          'data-tier': 'main', 
          'data-view': 'calendar',
          class: currentView?.group === 'dashboard' && currentView?.viewType === 'calendar' ? 'active' : ''
        }, 'Dashboard'),
        this.createElement('a', {
          'data-nav': '',
          'data-group': 'salesboard',
          'data-tier': 'main', 
          'data-view': 'board',
          class: currentView?.group === 'salesboard' ? 'active' : ''
        }, 'Salesboard'),
        this.createElement('a', {
          'data-nav': '',
          'data-group': 'entities',
          'data-tier': 'opportunities', 
          'data-view': 'list',
          class: currentView?.tier === 'opportunities' ? 'active' : ''
        }, 'Opportunities'),
        this.createElement('a', {
          'data-nav': '',
          'data-group': 'entities',
          'data-tier': 'calendar', 
          'data-view': 'monthly',
          class: currentView?.tier === 'calendar' ? 'active' : ''
        }, 'Calendar')
      ]),
      
      // Main content
      this.createElement('main', {}, [
        loading ? this.createElement('div', { class: 'loading-indicator' }) : null,
        this.createElement('div', { class: 'content-area', id: 'content' })
      ]),
      
      // Footer
      this.createElement('footer', {}, [
        this.createElement('div', {}, '© 2025 SalesBlanket'),
        this.createElement('div', { class: 'footer-actions' }, [
          this.createElement('a', { class: 'footer-action', href: '#' }, 'Dashboard'),
          this.createElement('a', { class: 'footer-action', href: '#' }, 'Seller Board'),
          this.createElement('a', { class: 'footer-action', href: '#' }, 'Closer Board')
        ])
      ])
    ]);
    
    this.shadowRoot.appendChild(container);
    
    // Initialize the view handler with the content area
    const contentArea = this.shadowRoot.querySelector('#content');
    if (contentArea && !this.initialized) {
      this.viewHandler.initialize(contentArea);
      this.initialized = true;
    }
  }

  /**
   * Cleanup when removed from DOM
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

// Register the component
if (!customElements.get('page-view')) {
  customElements.define('page-view', PageView);
}

export default PageView;