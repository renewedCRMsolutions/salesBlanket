/**
 * SalesCollectionsView.js
 * 
 * View component for displaying and managing sales collections.
 * Shows collections in a grid layout with filtering and sorting options.
 */

import { BaseView } from '../components/BaseView.js';
import ViewState from '../services/ViewState.js';

export class SalesCollectionsView extends BaseView {
  constructor() {
    super();
    this.viewState = ViewState;
    
    // Bind methods
    this.handleCollectionSelect = this.handleCollectionSelect.bind(this);
    this.handleAddCollection = this.handleAddCollection.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
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
          type: 'Campaign',
          items: 32, 
          created: '2025-03-15',
          createdBy: 'Jane Smith',
          progress: 65,
          status: 'Active'
        },
        { 
          id: 2, 
          name: 'High-Value Prospects', 
          type: 'List',
          items: 47, 
          created: '2025-01-22',
          createdBy: 'Robert Wolfe',
          progress: 30,
          status: 'Active'
        },
        { 
          id: 3, 
          name: 'Downtown Follow-ups', 
          type: 'Task List',
          items: 25, 
          created: '2025-02-10',
          createdBy: 'Jane Smith',
          progress: 80,
          status: 'Active'
        },
        { 
          id: 4, 
          name: 'Archived Leads Q4 2024', 
          type: 'Archive',
          items: 118, 
          created: '2024-12-15',
          createdBy: 'System',
          progress: 100,
          status: 'Archived'
        }
      ],
      selectedCollectionId: null,
      searchQuery: '',
      filter: 'all',
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
   * Handle filter selection
   * @param {Event} event - Click event
   */
  handleFilter(event) {
    const filterItem = event.target.closest('[data-filter]');
    if (!filterItem) return;
    
    const filter = filterItem.dataset.filter;
    this.setState({ filter });
    
    // In a real implementation, this would filter collections
  }

  /**
   * Handle search input
   * @param {Event} event - Input event
   */
  handleSearch(event) {
    const query = event.target.value;
    this.setState({ searchQuery: query });
    
    // In a real implementation, this would filter collections or trigger API search
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    // Collection selection
    const collectionsGrid = this.shadowRoot.querySelector('.collections-grid');
    if (collectionsGrid) {
      this.addTrackedEventListener('click', this.handleCollectionSelect, {}, collectionsGrid);
    }
    
    // Add collection button
    const addButton = this.shadowRoot.querySelector('.add-collection-button');
    if (addButton) {
      this.addTrackedEventListener('click', this.handleAddCollection, {}, addButton);
    }
    
    // Filter tabs
    const filterTabs = this.shadowRoot.querySelector('.filter-tabs');
    if (filterTabs) {
      this.addTrackedEventListener('click', this.handleFilter, {}, filterTabs);
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
      
      .sales-collections {
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: #f5f5f5;
        padding: 1.5rem;
      }
      
      .collections-header {
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .collections-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: #2F4F2F; /* Brewster Green */
      }
      
      .collections-controls {
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
      
      .filter-tabs {
        display: flex;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #eee;
      }
      
      .filter-tab {
        padding: 0.75rem 1.25rem;
        cursor: pointer;
        transition: all 0.2s;
        border-bottom: 2px solid transparent;
        color: #666;
      }
      
      .filter-tab:hover {
        color: #2F4F2F;
      }
      
      .filter-tab.active {
        color: #2F4F2F;
        border-bottom-color: #2F4F2F;
        font-weight: 500;
      }
      
      .collections-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }
      
      .collection-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .collection-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
      
      .collection-card.selected {
        border: 2px solid #2F4F2F;
      }
      
      .card-header {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .collection-name {
        font-weight: 500;
        color: #1A3A59; /* Golf Blau */
      }
      
      .collection-type {
        font-size: 0.85rem;
        padding: 0.25rem 0.5rem;
        background-color: #f0f0f0;
        border-radius: 4px;
      }
      
      .card-body {
        padding: 1rem;
      }
      
      .collection-info {
        margin-bottom: 1rem;
      }
      
      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
      }
      
      .info-label {
        color: #666;
      }
      
      .info-value {
        font-weight: 500;
      }
      
      .progress-bar-container {
        height: 6px;
        background-color: #eee;
        border-radius: 3px;
        overflow: hidden;
      }
      
      .progress-bar {
        height: 100%;
        background-color: #9CCB19; /* Lime Green */
      }
      
      .status-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.85rem;
        margin-top: 0.5rem;
      }
      
      .status-badge.active {
        background-color: #9CCB19; /* Lime Green */
        color: white;
      }
      
      .status-badge.archived {
        background-color: #eee;
        color: #666;
      }
      
      .empty-state {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        color: #666;
        text-align: center;
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
      searchQuery, 
      filter, 
      loading 
    } = this.getState();
    
    // Filter collections based on selected filter
    const filteredCollections = collections.filter(collection => {
      if (filter === 'all') return true;
      if (filter === 'active') return collection.status === 'Active';
      if (filter === 'archived') return collection.status === 'Archived';
      return true;
    });
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    const container = this.createElement('div', { class: 'sales-collections' }, [
      // Collections header
      this.createElement('div', { class: 'collections-header' }, [
        this.createElement('div', { class: 'collections-title' }, 'salesCollections'),
        this.createElement('div', { class: 'collections-controls' }, [
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
      
      // Filter tabs
      this.createElement('div', { class: 'filter-tabs' }, [
        this.createElement('div', { 
          class: `filter-tab ${filter === 'all' ? 'active' : ''}`,
          'data-filter': 'all'
        }, 'All Collections'),
        this.createElement('div', { 
          class: `filter-tab ${filter === 'active' ? 'active' : ''}`,
          'data-filter': 'active'
        }, 'Active'),
        this.createElement('div', { 
          class: `filter-tab ${filter === 'archived' ? 'active' : ''}`,
          'data-filter': 'archived'
        }, 'Archived')
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
                this.createElement('div', { class: 'collection-name' }, collection.name),
                this.createElement('div', { class: 'collection-type' }, collection.type)
              ]),
              this.createElement('div', { class: 'card-body' }, [
                this.createElement('div', { class: 'collection-info' }, [
                  this.createElement('div', { class: 'info-row' }, [
                    this.createElement('div', { class: 'info-label' }, 'Items:'),
                    this.createElement('div', { class: 'info-value' }, collection.items)
                  ]),
                  this.createElement('div', { class: 'info-row' }, [
                    this.createElement('div', { class: 'info-label' }, 'Created:'),
                    this.createElement('div', { class: 'info-value' }, collection.created)
                  ]),
                  this.createElement('div', { class: 'info-row' }, [
                    this.createElement('div', { class: 'info-label' }, 'By:'),
                    this.createElement('div', { class: 'info-value' }, collection.createdBy)
                  ])
                ]),
                this.createElement('div', { class: 'progress-bar-container' }, 
                  this.createElement('div', { 
                    class: 'progress-bar',
                    style: `width: ${collection.progress}%`
                  })
                ),
                this.createElement('div', { 
                  class: `status-badge ${collection.status.toLowerCase()}`
                }, collection.status)
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
  customElements.define('sales-collections-view', SalesCollectionsView);
} catch (error) {
  console.warn('Error registering sales-collections-view:', error);
}

export default SalesCollectionsView;