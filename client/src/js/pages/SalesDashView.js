/**
 * SalesDashView.js
 * 
 * Main dashboard view component for SalesBlanket.
 * This is the default landing page after login.
 */

import { BaseView } from '../components/BaseView.js';
import ViewState from '../services/ViewState.js';
import '../components/entity/AddEntityModal.js';

export class SalesDashView extends BaseView {
  constructor() {
    super();
    this.viewState = ViewState;
    
    // Bind methods
    this.handleModuleSelect = this.handleModuleSelect.bind(this);
    this.handleNavigation = this.handleNavigation.bind(this);
    this.handleSectionSelect = this.handleSectionSelect.bind(this);
    this.handleTrackAction = this.handleTrackAction.bind(this);
    this.handleAddRecord = this.handleAddRecord.bind(this);
    this.handleEntityCreated = this.handleEntityCreated.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      user: this.viewState.getState('user') || { name: 'User' },
      activeModule: 'dashboard',
      activeSection: 'overview',
      metrics: {
        todayAddresses: 15,
        weekAddresses: 87,
        monthAddresses: 342,
        todayContacts: 8,
        weekContacts: 42,
        monthContacts: 156,
        todayOpportunities: 3,
        weekOpportunities: 12,
        monthOpportunities: 48,
        conversionRate: '18.4%',
        activeTracks: 5,
        completedTouchpoints: 27
      },
      recentActivity: [
        { id: 1, type: 'address', action: 'knock', entity: 'Chicago HQ', time: '15 mins ago', user: 'Jane Smith' },
        { id: 2, type: 'contact', action: 'added', entity: 'Daniel Kozlowski', time: '1 hour ago', user: 'Jane Smith' },
        { id: 3, type: 'opportunity', action: 'qualified', entity: 'Roofing Project', time: '3 hours ago', user: 'Robert Wolfe' },
        { id: 4, type: 'address', action: 'scheduled', entity: '921 Edgar St', time: 'Yesterday', user: 'Jane Smith' },
        { id: 5, type: 'opportunity', action: 'won', entity: 'Commercial Project', time: 'Yesterday', user: 'Robert Wolfe' }
      ],
      upcomingTasks: [
        { id: 1, title: 'Follow up with Daniel', due: '2h', priority: 'high' },
        { id: 2, title: 'Complete project estimate', due: 'Today', priority: 'medium' },
        { id: 3, title: 'Knock 921 Edgar St', due: 'Tomorrow', priority: 'high' },
        { id: 4, title: 'Meeting with sales team', due: 'Friday', priority: 'medium' }
      ],
      salesTracks: [
        { id: 1, name: 'North Side Drive', progress: 65, stops: 12, completed: 8 },
        { id: 2, name: 'Downtown Loop', progress: 30, stops: 20, completed: 6 },
        { id: 3, name: 'South Commercial', progress: 80, stops: 15, completed: 12 }
      ],
      loading: false
    };
    
    // In a real implementation, we would fetch dashboard data from API
    // this.loadDashboardData();
  }

  /**
   * Load dashboard data (would connect to API in real implementation)
   */
  async loadDashboardData() {
    try {
      this.setState({ loading: true });
      
      // API calls would go here
      
      this.setState({ loading: false });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.setState({ 
        error: 'Failed to load dashboard data',
        loading: false
      });
    }
  }

  /**
   * Handle module selection
   * @param {Event} event - Click event
   */
  handleModuleSelect(event) {
    const moduleItem = event.target.closest('[data-module]');
    if (!moduleItem) return;
    
    const module = moduleItem.dataset.module;
    this.setState({ activeModule: module });
    
    // Update URL without reload
    const url = `/${module}/main/view`;
    window.history.pushState({ module }, '', url);
    
    // Dispatch event for ViewHandler to handle
    window.dispatchEvent(new CustomEvent('navigation', {
      detail: { 
        group: module,
        tier: 'main',
        view: 'view'
      }
    }));
  }

  /**
   * Handle navigation
   * @param {Event} event - Click event
   */
  handleNavigation(event) {
    const navItem = event.target.closest('[data-nav]');
    if (!navItem) return;
    
    const { group, tier, view } = navItem.dataset;
    
    // Update URL without reload
    const url = `/${group}/${tier}/${view}`;
    window.history.pushState({ group, tier, view }, '', url);
    
    // Dispatch event for ViewHandler to handle
    window.dispatchEvent(new CustomEvent('navigation', {
      detail: { group, tier, view }
    }));
  }

  /**
   * Handle section selection
   * @param {Event} event - Click event
   */
  handleSectionSelect(event) {
    const sectionItem = event.target.closest('[data-section]');
    if (!sectionItem) return;
    
    const section = sectionItem.dataset.section;
    this.setState({ activeSection: section });
  }

  /**
   * Handle track action
   * @param {Event} event - Click event
   */
  handleTrackAction(event) {
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;
    
    const action = actionButton.dataset.action;
    const trackId = parseInt(actionButton.dataset.trackId, 10);
    
    if (action === 'view') {
      // Navigate to track view
      window.history.pushState({ 
        group: 'tracks', 
        tier: 'main', 
        view: 'view',
        trackId
      }, '', `/tracks/main/view?id=${trackId}`);
      
      // Dispatch event for ViewHandler to handle
      window.dispatchEvent(new CustomEvent('navigation', {
        detail: { 
          group: 'tracks',
          tier: 'main',
          view: 'view',
          params: { id: trackId }
        }
      }));
    }
  }

  /**
   * Handle add record button click
   */
  handleAddRecord() {
    const addEntityModal = this.shadowRoot.querySelector('add-entity-modal');
    if (addEntityModal) {
      addEntityModal.open();
    }
  }
  
  /**
   * Handle entity created event
   * @param {CustomEvent} event - Entity created event
   */
  handleEntityCreated(event) {
    const { type } = event.detail;
    
    // Show success notification
    this.showNotification(`${type} created successfully`, 'success');
    
    // In a real implementation, we would refresh data
    // this.loadDashboardData();
  }
  
  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, info)
   */
  showNotification(message, type = 'info') {
    const notification = this.createElement('div', {
      class: `notification notification-${type}`,
      style: `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        background-color: ${type === 'success' ? '#9CCB19' : type === 'error' ? '#960018' : '#1A3A59'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: fadeIn 0.3s, fadeOut 0.3s 3.7s;
      `
    }, message);
    
    document.body.appendChild(notification);
    
    // Remove notification after 4 seconds
    setTimeout(() => {
      notification.remove();
    }, 4000);
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    // Module selection
    const moduleNav = this.shadowRoot.querySelector('.module-nav');
    if (moduleNav) {
      this.addTrackedEventListener('click', this.handleModuleSelect, {}, moduleNav);
    }
    
    // Navigation
    const mainNav = this.shadowRoot.querySelector('.main-nav');
    if (mainNav) {
      this.addTrackedEventListener('click', this.handleNavigation, {}, mainNav);
    }
    
    // Section selection
    const sectionNav = this.shadowRoot.querySelector('.section-nav');
    if (sectionNav) {
      this.addTrackedEventListener('click', this.handleSectionSelect, {}, sectionNav);
    }
    
    // Track actions
    const tracksPanel = this.shadowRoot.querySelector('.tracks-list');
    if (tracksPanel) {
      this.addTrackedEventListener('click', this.handleTrackAction, {}, tracksPanel);
    }
    
    // Add record button
    const addButton = this.shadowRoot.querySelector('.add-button');
    if (addButton) {
      this.addTrackedEventListener('click', this.handleAddRecord, {}, addButton);
    }
    
    // Entity created event
    this.addTrackedEventListener('entity-created', this.handleEntityCreated);
  }

  /**
   * Get component styles
   * @returns {string} CSS styles
   */
  getStyles() {
    return `
      ${super.getStyles()}
      
      :host {
        display: block;
        height: 100%;
      }
      
      .sales-dash {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      
      .main-header {
        padding: 0.75rem 1.5rem;
        background-color: #2F4F2F; /* Brewster Green */
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .logo-container {
        display: flex;
        align-items: center;
      }
      
      .logo {
        font-size: 1.5rem;
        font-weight: bold;
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
      
      .search-bar {
        position: relative;
      }
      
      .search-input {
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        border: none;
        min-width: 300px;
        background-color: rgba(255,255,255,0.1);
        color: white;
      }
      
      .search-input::placeholder {
        color: rgba(255,255,255,0.6);
      }
      
      .user-controls {
        display: flex;
        align-items: center;
        gap: 0.8rem;
      }
      
      .user-profile {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
      }
      
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #1A3A59; /* Golf Blau */
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }
      
      .add-button {
        background-color: #9CCB19; /* Lime Green */
        color: #1A3A59;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
      }
      
      .nav-bar {
        background-color: #1A3A59; /* Golf Blau */
        display: flex;
        padding: 0.5rem 1rem;
        overflow-x: auto;
      }
      
      .nav-list {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      
      .nav-item {
        margin-right: 1rem;
      }
      
      .nav-link {
        color: white;
        text-decoration: none;
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        transition: background-color 0.2s;
        cursor: pointer;
      }
      
      .nav-link:hover {
        background-color: rgba(255,255,255,0.1);
      }
      
      .nav-link.active {
        background-color: rgba(255,255,255,0.2);
        font-weight: bold;
      }
      
      .dashboard-content {
        flex: 1;
        padding: 1.5rem;
        overflow-y: auto;
        background-color: #f5f5f5;
      }
      
      .dashboard-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 1.5rem;
        color: #2F4F2F; /* Brewster Green */
      }
      
      .dashboard-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1.5rem;
      }
      
      .dashboard-panel {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        overflow: hidden;
      }
      
      .dashboard-sidebar {
        display: flex;
        flex-direction: column;
      }
      
      .panel-header {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .panel-body {
        padding: 1rem;
      }
      
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
      }
      
      .metric-card {
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
      }
      
      .metric-title {
        font-size: 0.85rem;
        color: #666;
        margin-bottom: 0.5rem;
      }
      
      .metric-value {
        font-size: 1.75rem;
        font-weight: bold;
        color: #2F4F2F; /* Brewster Green */
      }
      
      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      
      .activity-item {
        display: flex;
        align-items: center;
        padding: 0.75rem;
        border-radius: 4px;
        background-color: #f9f9f9;
      }
      
      .activity-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #eee;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 0.75rem;
      }
      
      .activity-icon[data-type="address"] {
        background-color: #3B7B9E; /* Fjord */
        color: white;
      }
      
      .activity-icon[data-type="contact"] {
        background-color: #2D4A71; /* Shark Blue */
        color: white;
      }
      
      .activity-icon[data-type="opportunity"] {
        background-color: #9CCB19; /* Lime Green */
        color: white;
      }
      
      .activity-details {
        flex: 1;
      }
      
      .activity-description {
        font-weight: 500;
      }
      
      .activity-meta {
        font-size: 0.8rem;
        color: #888;
        margin-top: 0.25rem;
      }
      
      .task-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .task-item {
        padding: 0.75rem;
        border-radius: 4px;
        background-color: #f9f9f9;
        display: flex;
        align-items: center;
      }
      
      .task-priority {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 0.75rem;
      }
      
      .task-priority[data-priority="high"] {
        background-color: #960018; /* Carmine Red */
      }
      
      .task-priority[data-priority="medium"] {
        background-color: #FFC20E; /* Racing Yellow */
      }
      
      .task-priority[data-priority="low"] {
        background-color: #9CCB19; /* Lime Green */
      }
      
      .task-details {
        flex: 1;
      }
      
      .task-title {
        font-weight: 500;
      }
      
      .task-due {
        font-size: 0.8rem;
        background-color: #eee;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
      }
      
      .tracks-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .track-item {
        padding: 1rem;
        border-radius: 4px;
        background-color: #f9f9f9;
      }
      
      .track-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }
      
      .track-name {
        font-weight: bold;
        font-size: 1.1rem;
        color: #2F4F2F; /* Brewster Green */
      }
      
      .track-stats {
        font-size: 0.9rem;
        color: #666;
      }
      
      .track-progress-container {
        height: 8px;
        background-color: #eee;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.75rem;
      }
      
      .track-progress-bar {
        height: 100%;
        background-color: #9CCB19; /* Lime Green */
      }
      
      .track-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.5rem;
      }
      
      .track-action-button {
        background-color: #1A3A59; /* Golf Blau */
        color: white;
        border: none;
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
      }
      
      .loadingSpinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: #2F4F2F;
        animation: spin 1s ease-in-out infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
  }

  /**
   * Render component
   */
  render() {
    const { 
      user, 
      activeModule, 
      activeSection,
      metrics, 
      recentActivity, 
      upcomingTasks, 
      salesTracks,
      loading 
    } = this.getState();
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    // Create dashboard structure
    const container = this.createElement('div', { class: 'sales-dash' }, [
      // Add Entity Modal
      this.createElement('add-entity-modal'),
      
      // Main header
      this.createElement('header', { class: 'main-header' }, [
        this.createElement('div', { class: 'logo-container' }, [
          this.createElement('div', { class: 'logo' }, 'SalesBlanket'),
          this.createElement('div', { class: 'version' }, 'v4')
        ]),
        this.createElement('div', { class: 'header-controls' }, [
          this.createElement('button', { class: 'add-button' }, '+ Add Record'),
          this.createElement('div', { class: 'search-bar' }, 
            this.createElement('input', { 
              type: 'text', 
              class: 'search-input', 
              placeholder: 'Search addresses, contacts, opportunities...' 
            })
          ),
          this.createElement('div', { class: 'user-controls' }, [
            this.createElement('div', { class: 'user-profile' }, [
              this.createElement('div', { class: 'avatar' }, user.name.charAt(0)),
              this.createElement('div', { class: 'user-name' }, user.name)
            ])
          ])
        ])
      ]),
      
      // Module navigation
      this.createElement('nav', { class: 'nav-bar module-nav' }, [
        this.createElement('ul', { class: 'nav-list' }, [
          this.createElement('li', { class: 'nav-item' }, 
            this.createElement('a', { 
              class: `nav-link ${activeModule === 'dashboard' ? 'active' : ''}`,
              'data-module': 'dashboard'
            }, 'dashboard')
          ),
          this.createElement('li', { class: 'nav-item' }, 
            this.createElement('a', { 
              class: `nav-link ${activeModule === 'salesboard' ? 'active' : ''}`,
              'data-module': 'salesboard'
            }, 'salesBoard')
          ),
          this.createElement('li', { class: 'nav-item' }, 
            this.createElement('a', { 
              class: `nav-link ${activeModule === 'tracks' ? 'active' : ''}`,
              'data-module': 'tracks'
            }, 'salesTracks')
          ),
          this.createElement('li', { class: 'nav-item' }, 
            this.createElement('a', { 
              class: `nav-link ${activeModule === 'collections' ? 'active' : ''}`,
              'data-module': 'collections'
            }, 'salesCollection')
          ),
          this.createElement('li', { class: 'nav-item' }, 
            this.createElement('a', { 
              class: `nav-link ${activeModule === 'zones' ? 'active' : ''}`,
              'data-module': 'zones'
            }, 'salesZones')
          )
        ])
      ]),
      
      // Main navigation
      this.createElement('nav', { class: 'nav-bar main-nav' }, [
        this.createElement('ul', { class: 'nav-list' }, [
          this.createElement('li', { class: 'nav-item' }, 
            this.createElement('a', { 
              class: 'nav-link',
              'data-nav': '',
              'data-group': 'dashboard', 
              'data-tier': 'main', 
              'data-view': 'calendar'
            }, 'calendar')
          ),
          this.createElement('li', { class: 'nav-item' }, 
            this.createElement('a', { 
              class: 'nav-link',
              'data-nav': '',
              'data-group': 'zones', 
              'data-tier': 'neighborhoods', 
              'data-view': 'list'
            }, 'neighborhoods')
          ),
          this.createElement('li', { class: 'nav-item' }, 
            this.createElement('a', { 
              class: 'nav-link',
              'data-nav': '',
              'data-group': 'zones', 
              'data-tier': 'streets', 
              'data-view': 'list'
            }, 'streets')
          ),
          this.createElement('li', { class: 'nav-item' }, 
            this.createElement('a', { 
              class: 'nav-link',
              'data-nav': '',
              'data-group': 'entities', 
              'data-tier': 'contacts', 
              'data-view': 'list'
            }, 'contacts')
          )
        ])
      ]),
      
      // Dashboard content
      this.createElement('div', { class: 'dashboard-content' }, [
        this.createElement('div', { class: 'dashboard-title' }, 'Sales Dashboard'),
        
        // Top metrics
        this.createElement('div', { class: 'metrics-grid' }, [
          this.createElement('div', { class: 'metric-card' }, [
            this.createElement('div', { class: 'metric-title' }, 'Today\'s Addresses'),
            this.createElement('div', { class: 'metric-value' }, metrics.todayAddresses)
          ]),
          this.createElement('div', { class: 'metric-card' }, [
            this.createElement('div', { class: 'metric-title' }, 'Today\'s Contacts'),
            this.createElement('div', { class: 'metric-value' }, metrics.todayContacts)
          ]),
          this.createElement('div', { class: 'metric-card' }, [
            this.createElement('div', { class: 'metric-title' }, 'Today\'s Opportunities'),
            this.createElement('div', { class: 'metric-value' }, metrics.todayOpportunities)
          ]),
          this.createElement('div', { class: 'metric-card' }, [
            this.createElement('div', { class: 'metric-title' }, 'Conversion Rate'),
            this.createElement('div', { class: 'metric-value' }, metrics.conversionRate)
          ]),
          this.createElement('div', { class: 'metric-card' }, [
            this.createElement('div', { class: 'metric-title' }, 'Active Sales Tracks'),
            this.createElement('div', { class: 'metric-value' }, metrics.activeTracks)
          ]),
          this.createElement('div', { class: 'metric-card' }, [
            this.createElement('div', { class: 'metric-title' }, 'Completed Touchpoints'),
            this.createElement('div', { class: 'metric-value' }, metrics.completedTouchpoints)
          ])
        ]),
        
        // Main grid
        this.createElement('div', { class: 'dashboard-grid', style: 'margin-top: 1.5rem;' }, [
          // Main content panel - Sales tracks
          this.createElement('div', { class: 'dashboard-panel' }, [
            this.createElement('div', { class: 'panel-header' }, [
              'Active Sales Tracks',
              loading ? this.createElement('div', { class: 'loadingSpinner' }) : null
            ]),
            this.createElement('div', { class: 'panel-body' }, [
              this.createElement('div', { class: 'tracks-list' },
                salesTracks.map(track => 
                  this.createElement('div', { class: 'track-item' }, [
                    this.createElement('div', { class: 'track-header' }, [
                      this.createElement('div', { class: 'track-name' }, track.name),
                      this.createElement('div', { class: 'track-stats' }, 
                        `${track.completed}/${track.stops} stops`
                      )
                    ]),
                    this.createElement('div', { class: 'track-progress-container' }, [
                      this.createElement('div', { 
                        class: 'track-progress-bar',
                        style: `width: ${track.progress}%`
                      })
                    ]),
                    this.createElement('div', { class: 'track-actions' }, [
                      this.createElement('button', { 
                        class: 'track-action-button',
                        'data-action': 'view',
                        'data-track-id': track.id
                      }, 'View')
                    ])
                  ])
                )
              )
            ])
          ]),
          
          // Side panel - sidebar nav
          this.createElement('div', { class: 'dashboard-sidebar' }, [
            // Recent activity panel
            this.createElement('div', { class: 'dashboard-panel' }, [
              this.createElement('div', { class: 'panel-header' }, [
                'Recent Activity',
                loading ? this.createElement('div', { class: 'loadingSpinner' }) : null
              ]),
              this.createElement('div', { class: 'panel-body' }, [
                this.createElement('div', { class: 'activity-list' },
                  recentActivity.map(activity => 
                    this.createElement('div', { class: 'activity-item' }, [
                      this.createElement('div', { 
                        class: 'activity-icon',
                        'data-type': activity.type
                      }, activity.type.charAt(0).toUpperCase()),
                      this.createElement('div', { class: 'activity-details' }, [
                        this.createElement('div', { class: 'activity-description' }, 
                          `${activity.action.charAt(0).toUpperCase() + activity.action.slice(1)} ${activity.entity}`
                        ),
                        this.createElement('div', { class: 'activity-meta' }, 
                          `${activity.time} by ${activity.user}`
                        )
                      ])
                    ])
                  )
                )
              ])
            ]),
            
            // Upcoming tasks panel
            this.createElement('div', { class: 'dashboard-panel', style: 'margin-top: 1rem;' }, [
              this.createElement('div', { class: 'panel-header' }, [
                'Upcoming Tasks',
                loading ? this.createElement('div', { class: 'loadingSpinner' }) : null
              ]),
              this.createElement('div', { class: 'panel-body' }, [
                this.createElement('div', { class: 'task-list' },
                  upcomingTasks.map(task => 
                    this.createElement('div', { class: 'task-item' }, [
                      this.createElement('div', { 
                        class: 'task-priority',
                        'data-priority': task.priority
                      }),
                      this.createElement('div', { class: 'task-details' }, [
                        this.createElement('div', { class: 'task-title' }, task.title)
                      ]),
                      this.createElement('div', { class: 'task-due' }, `Due: ${task.due}`)
                    ])
                  )
                )
              ])
            ])
          ])
        ])
      ])
    ]);
    
    this.shadowRoot.appendChild(container);
  }
}

// Register component
try {
  customElements.define('sales-dash-view', SalesDashView);
} catch (error) {
  console.warn('Error registering sales-dash-view:', error);
}

export default SalesDashView;