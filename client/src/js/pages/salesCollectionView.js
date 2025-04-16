/**
 * salesCollectionView.js
 * 
 * View component for displaying and managing sales collections.
 * Shows collections with integrated pulse system.
 */

import { BaseView } from '../components/BaseView.js';
import ViewState from '../services/ViewState.js';

export class salesCollectionView extends BaseView {
  constructor() {
    super();
    this.viewState = ViewState;
    
    // Bind methods
    this.handleCollectionSelect = this.handleCollectionSelect.bind(this);
    this.handleAddCollection = this.handleAddCollection.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      collections: [
        { 
          id: 1, 
          name: 'Spring 2025 Campaign', 
          description: 'Targeted outreach for residential roofing opportunities.',
          type: 'Group',
          entities: [
            { type: 'contact', count: 32 },
            { type: 'neighborhood', count: 4 },
            { type: 'street', count: 12 }
          ],
          pulseActivities: [
            { type: 'email', count: 48, lastActivity: '15 mins ago' },
            { type: 'calendar', count: 12, lastActivity: '1 hour ago' },
            { type: 'task', count: 22, lastActivity: '3 hours ago' }
          ],
          createdBy: 'Jane Smith',
          createdAt: '2025-03-10T14:32:00Z'
        },
        { 
          id: 2, 
          name: 'High-Value Commercial', 
          description: 'Key commercial accounts requiring special attention.',
          type: 'Group',
          entities: [
            { type: 'contact', count: 18 },
            { type: 'neighborhood', count: 2 },
            { type: 'street', count: 6 }
          ],
          pulseActivities: [
            { type: 'email', count: 35, lastActivity: '30 mins ago' },
            { type: 'calendar', count: 8, lastActivity: '2 days ago' },
            { type: 'task', count: 15, lastActivity: '1 day ago' }
          ],
          createdBy: 'Robert Wolfe',
          createdAt: '2025-02-15T09:45:00Z'
        },
        { 
          id: 3, 
          name: 'Downtown Follow-ups', 
          description: 'Follow-up activities for downtown leads from Q1.',
          type: 'Group',
          entities: [
            { type: 'contact', count: 25 },
            { type: 'neighborhood', count: 1 },
            { type: 'street', count: 8 }
          ],
          pulseActivities: [
            { type: 'email', count: 42, lastActivity: '2 hours ago' },
            { type: 'calendar', count: 10, lastActivity: '3 days ago' },
            { type: 'task', count: 18, lastActivity: '4 hours ago' }
          ],
          createdBy: 'Jane Smith',
          createdAt: '2025-03-05T11:20:00Z'
        }
      ],
      selectedCollectionId: null,
      activeTab: 'all',
      searchQuery: '',
      loading: false,
      error: null
    };
    
    // In a real implementation, we would fetch collection data from API
    // this.loadCollections();
  }

  /**
   * Load collections data (would connect to API in real implementation)
   */
  async loadCollections() {
    try {
      this.setState({ loading: true });
      
      // API calls would go here
      
      this.setState({ loading: false });
    } catch (error) {
      console.error('Error loading collections data:', error);
      this.setState({ 
        error: 'Failed to load collections data',
        loading: false
      });
    }
  }

  /**
   * Handle collection selection
   * @param {Event} event - Click event
   */
  handleCollectionSelect(event) {
    const collectionCard = event.target.closest('[data-collection-id]');
    if (!collectionCard) return;
    
    const collectionId = parseInt(collectionCard.dataset.collectionId, 10);
    this.setState({ selectedCollectionId: collectionId });
    
    // In a real implementation, this would navigate to the collection detail view
  }

  /**
   * Handle add collection button click
   */
  handleAddCollection() {
    // In a real implementation, this would open a collection creation modal
    alert('Add collection functionality would open here');
  }

  /**
   * Handle tab change
   * @param {Event} event - Click event
   */
  handleTabChange(event) {
    const tab = event.target.closest('[data-tab]');
    if (!tab) return;
    
    const tabId = tab.dataset.tab;
    this.setState({ activeTab: tabId });
  }

  /**
   * Handle search input
   * @param {Event} event - Input event
   */
  handleSearch(event) {
    const query = event.target.value;
    this.setState({ searchQuery: query });
    
    // In a real implementation, this would filter collections
  }

  /**
   * Format date to readable string
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    // Collection selection
    const collectionsList = this.shadowRoot.querySelector('.collections-grid');
    if (collectionsList) {
      this.addTrackedEventListener('click', this.handleCollectionSelect, {}, collectionsList);
    }
    
    // Add collection button
    const addButton = this.shadowRoot.querySelector('.add-collection-button');
    if (addButton) {
      this.addTrackedEventListener('click', this.handleAddCollection, {}, addButton);
    }
    
    // Tab navigation
    const tabNav = this.shadowRoot.querySelector('.tabs-nav');
    if (tabNav) {
      this.addTrackedEventListener('click', this.handleTabChange, {}, tabNav);
    }
    
    // Search input
    const searchInput = this.shadowRoot.querySelector('.search-input');
    if (searchInput) {
      this.addTrackedEventListener('input', this.handleSearch, {}, searchInput);
    }
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
      
      .sales-collection {
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: #f5f5f5;
        padding: 1.5rem;
      }
      
      .collection-header {
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .collection-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: #2F4F2F; /* Brewster Green */
      }
      
      .collection-controls {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      
      .search-bar {
        position: relative;
      }
      
      .search-input {
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        border: 1px solid #ddd;
        min-width: 250px;
      }
      
      .add-collection-button {
        background-color: #9CCB19; /* Lime Green */
        color: #1A3A59;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
      }
      
      .tabs-nav {
        display: flex;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #ddd;
      }
      
      .tab-item {
        padding: 0.75rem 1.5rem;
        cursor: pointer;
        font-weight: 500;
        color: #666;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
      }
      
      .tab-item:hover {
        color: #1A3A59;
      }
      
      .tab-item.active {
        color: #1A3A59;
        border-bottom-color: #1A3A59;
      }
      
      .collections-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }
      
      .collection-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        overflow: hidden;
        transition: transform 0.2s, box-shadow 0.2s;
        cursor: pointer;
      }
      
      .collection-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
      
      .collection-card.selected {
        box-shadow: 0 0 0 2px #1A3A59;
      }
      
      .card-header {
        padding: 1.25rem;
        border-bottom: 1px solid #eee;
      }
      
      .card-title {
        font-size: 1.25rem;
        font-weight: 500;
        color: #1A3A59;
        margin-bottom: 0.5rem;
      }
      
      .card-description {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 0.75rem;
      }
      
      .card-meta {
        display: flex;
        font-size: 0.8rem;
        color: #888;
      }
      
      .card-meta-item {
        margin-right: 1rem;
      }
      
      .card-body {
        padding: 1.25rem;
      }
      
      .entity-section {
        margin-bottom: 1.25rem;
      }
      
      .section-title {
        font-weight: 500;
        margin-bottom: 0.75rem;
        color: #2F4F2F;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .entity-list {
        display: flex;
        gap: 0.75rem;
      }
      
      .entity-badge {
        display: flex;
        align-items: center;
        background-color: #f5f5f5;
        padding: 0.4rem 0.75rem;
        border-radius: 4px;
        font-size: 0.9rem;
      }
      
      .entity-icon {
        width: 16px;
        height: 16px;
        margin-right: 0.5rem;
      }
      
      .pulse-section {
        border-top: 1px solid #eee;
        padding-top: 1.25rem;
      }
      
      .pulse-activities {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
      }
      
      .pulse-activity {
        background-color: #f5f5f5;
        padding: 0.75rem;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
      }
      
      .activity-type {
        font-weight: 500;
        margin-bottom: 0.25rem;
        color: #1A3A59;
      }
      
      .activity-count {
        font-size: 1.25rem;
        font-weight: bold;
        margin-bottom: 0.25rem;
      }
      
      .activity-last {
        font-size: 0.8rem;
        color: #888;
      }
      
      .empty-state {
        grid-column: 1 / -1;
        background-color: white;
        padding: 3rem;
        border-radius: 8px;
        text-align: center;
        color: #666;
      }
      
      .loading-spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: #2F4F2F;
        animation: spin 1s ease-in-out infinite;
        margin-right: 0.5rem;
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
      collections, 
      selectedCollectionId, 
      activeTab,
      searchQuery,
      loading 
    } = this.getState();
    
    // Filter collections based on active tab
    const filteredCollections = collections.filter(collection => {
      if (activeTab === 'all') return true;
      if (activeTab === 'recent') {
        // Example: show collections from the last 7 days
        const creationDate = new Date(collection.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return creationDate >= sevenDaysAgo;
      }
      return true;
    });
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    const container = this.createElement('div', { class: 'sales-collection' }, [
      // Header
      this.createElement('div', { class: 'collection-header' }, [
        this.createElement('div', { class: 'collection-title' }, 'salesCollection'),
        this.createElement('div', { class: 'collection-controls' }, [
          this.createElement('div', { class: 'search-bar' }, 
            this.createElement('input', {
              type: 'text',
              class: 'search-input',
              placeholder: 'Search collections...',
              value: searchQuery
            })
          ),
          this.createElement('button', { class: 'add-collection-button' }, '+ Add Collection')
        ])
      ]),
      
      // Tabs
      this.createElement('div', { class: 'tabs-nav' }, [
        this.createElement('div', { 
          class: `tab-item ${activeTab === 'all' ? 'active' : ''}`,
          'data-tab': 'all'
        }, 'All Collections'),
        this.createElement('div', { 
          class: `tab-item ${activeTab === 'recent' ? 'active' : ''}`,
          'data-tab': 'recent'
        }, 'Recent'),
        this.createElement('div', { 
          class: `tab-item ${activeTab === 'favorites' ? 'active' : ''}`,
          'data-tab': 'favorites'
        }, 'Favorites')
      ]),
      
      // Collections grid
      this.createElement('div', { class: 'collections-grid' }, [
        filteredCollections.length === 0 ?
          this.createElement('div', { class: 'empty-state' }, [
            loading ? this.createElement('div', { class: 'loading-spinner' }) : null,
            'No collections found. Create your first collection to get started.'
          ]) :
          filteredCollections.map(collection => 
            this.createElement('div', { 
              class: `collection-card ${selectedCollectionId === collection.id ? 'selected' : ''}`,
              'data-collection-id': collection.id
            }, [
              this.createElement('div', { class: 'card-header' }, [
                this.createElement('div', { class: 'card-title' }, collection.name),
                this.createElement('div', { class: 'card-description' }, collection.description),
                this.createElement('div', { class: 'card-meta' }, [
                  this.createElement('div', { class: 'card-meta-item' }, `Created by: ${collection.createdBy}`),
                  this.createElement('div', { class: 'card-meta-item' }, `Date: ${this.formatDate(collection.createdAt)}`)
                ])
              ]),
              this.createElement('div', { class: 'card-body' }, [
                // Entity section
                this.createElement('div', { class: 'entity-section' }, [
                  this.createElement('div', { class: 'section-title' }, 'Entities'),
                  this.createElement('div', { class: 'entity-list' },
                    collection.entities.map(entity => 
                      this.createElement('div', { class: 'entity-badge' }, [
                        // Icon would be here in a real implementation
                        this.createElement('span', { class: 'entity-icon' }, entity.type.charAt(0).toUpperCase()),
                        `${entity.count} ${entity.type}${entity.count !== 1 ? 's' : ''}`
                      ])
                    )
                  )
                ]),
                
                // Pulse section
                this.createElement('div', { class: 'pulse-section' }, [
                  this.createElement('div', { class: 'section-title' }, 'Pulse Activities'),
                  this.createElement('div', { class: 'pulse-activities' },
                    collection.pulseActivities.map(activity => 
                      this.createElement('div', { class: 'pulse-activity' }, [
                        this.createElement('div', { class: 'activity-type' }, activity.type),
                        this.createElement('div', { class: 'activity-count' }, activity.count),
                        this.createElement('div', { class: 'activity-last' }, `Last: ${activity.lastActivity}`)
                      ])
                    )
                  )
                ])
              ])
            ])
          )
      ])
    ]);
    
    this.shadowRoot.appendChild(container);
  }
}

// Register component
try {
  customElements.define('sales-collection-view', salesCollectionView);
} catch (error) {
  console.warn('Error registering sales-collection-view:', error);
}

export default salesCollectionView;