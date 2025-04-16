/**
 * neighborhoodsListView.js
 * 
 * List view component for displaying and managing neighborhoods.
 */

import { BaseView } from '../components/BaseView.js';
import ViewState from '../services/ViewState.js';

export class neighborhoodsListView extends BaseView {
  constructor() {
    super();
    this.viewState = ViewState;
    
    // Bind methods
    this.handleNeighborhoodSelect = this.handleNeighborhoodSelect.bind(this);
    this.handleAddNeighborhood = this.handleAddNeighborhood.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      neighborhoods: [
        { 
          id: 1, 
          name: 'Downtown', 
          city: 'Chicago',
          state: 'IL',
          streets: 48,
          contacts: 215,
          status: 'Active'
        },
        { 
          id: 2, 
          name: 'River North', 
          city: 'Chicago',
          state: 'IL',
          streets: 32,
          contacts: 189,
          status: 'Active'
        },
        { 
          id: 3, 
          name: 'Lincoln Park', 
          city: 'Chicago',
          state: 'IL', 
          streets: 65,
          contacts: 310,
          status: 'Active'
        },
        { 
          id: 4, 
          name: 'Wicker Park', 
          city: 'Chicago',
          state: 'IL',
          streets: 29,
          contacts: 175,
          status: 'Active'
        }
      ],
      selectedNeighborhoodId: null,
      searchQuery: '',
      loading: false,
      error: null
    };
    
    // In a real implementation, we would fetch neighborhood data from API
    // this.loadNeighborhoods();
  }

  /**
   * Load neighborhoods data (would connect to API in real implementation)
   */
  async loadNeighborhoods() {
    try {
      this.setState({ loading: true });
      
      // API calls would go here
      
      this.setState({ loading: false });
    } catch (error) {
      console.error('Error loading neighborhoods data:', error);
      this.setState({ 
        error: 'Failed to load neighborhoods data',
        loading: false
      });
    }
  }

  /**
   * Handle neighborhood selection
   * @param {Event} event - Click event
   */
  handleNeighborhoodSelect(event) {
    const neighborhoodRow = event.target.closest('[data-neighborhood-id]');
    if (!neighborhoodRow) return;
    
    const neighborhoodId = parseInt(neighborhoodRow.dataset.neighborhoodId, 10);
    this.setState({ selectedNeighborhoodId: neighborhoodId });
    
    // In a real implementation, this would navigate to the neighborhood detail view
  }

  /**
   * Handle add neighborhood button click
   */
  handleAddNeighborhood() {
    // In a real implementation, this would open a neighborhood creation modal
    alert('Add neighborhood functionality would open here');
  }

  /**
   * Handle search input
   * @param {Event} event - Input event
   */
  handleSearch(event) {
    const query = event.target.value;
    this.setState({ searchQuery: query });
    
    // In a real implementation, this would filter neighborhoods or trigger API search
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    // Neighborhood selection
    const neighborhoodsTable = this.shadowRoot.querySelector('.neighborhoods-table');
    if (neighborhoodsTable) {
      this.addTrackedEventListener('click', this.handleNeighborhoodSelect, {}, neighborhoodsTable);
    }
    
    // Add neighborhood button
    const addButton = this.shadowRoot.querySelector('.add-neighborhood-button');
    if (addButton) {
      this.addTrackedEventListener('click', this.handleAddNeighborhood, {}, addButton);
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
      
      .neighborhoods-list {
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: #f5f5f5;
        padding: 1.5rem;
      }
      
      .list-header {
        margin-bottom: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .list-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: #2F4F2F; /* Brewster Green */
      }
      
      .list-controls {
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
      
      .add-neighborhood-button {
        background-color: #9CCB19; /* Lime Green */
        color: #1A3A59;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
      }
      
      .neighborhoods-table-container {
        flex: 1;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .neighborhoods-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .table-headers {
        background-color: #f9f9f9;
      }
      
      .table-header {
        text-align: left;
        padding: 1rem;
        font-weight: 500;
        border-bottom: 1px solid #eee;
      }
      
      .table-row {
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .table-row:hover {
        background-color: #f5f5f5;
      }
      
      .table-row.selected {
        background-color: #f0f7ff;
      }
      
      .table-cell {
        padding: 1rem;
      }
      
      .neighborhood-name {
        font-weight: 500;
        color: #1A3A59; /* Golf Blau */
      }
      
      .status-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.85rem;
      }
      
      .status-badge.active {
        background-color: #9CCB19; /* Lime Green */
        color: white;
      }
      
      .status-badge.inactive {
        background-color: #eee;
        color: #666;
      }
      
      .empty-state {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
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
      neighborhoods, 
      selectedNeighborhoodId, 
      searchQuery, 
      loading 
    } = this.getState();
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    const container = this.createElement('div', { class: 'neighborhoods-list' }, [
      // List header
      this.createElement('div', { class: 'list-header' }, [
        this.createElement('div', { class: 'list-title' }, 'neighborhoods'),
        this.createElement('div', { class: 'list-controls' }, [
          this.createElement('div', { class: 'search-bar' }, 
            this.createElement('input', {
              type: 'text',
              class: 'search-input',
              placeholder: 'Search neighborhoods...',
              value: searchQuery
            })
          ),
          this.createElement('button', { class: 'add-neighborhood-button' }, '+ Add Neighborhood')
        ])
      ]),
      
      // Neighborhoods table
      this.createElement('div', { class: 'neighborhoods-table-container' }, [
        neighborhoods.length === 0 ?
          this.createElement('div', { class: 'empty-state' }, [
            loading ? this.createElement('div', { class: 'loading-spinner' }) : null,
            'No neighborhoods found. Create your first neighborhood to get started.'
          ]) :
          this.createElement('table', { class: 'neighborhoods-table' }, [
            this.createElement('thead', { class: 'table-headers' }, 
              this.createElement('tr', {}, [
                this.createElement('th', { class: 'table-header' }, 'Name'),
                this.createElement('th', { class: 'table-header' }, 'City'),
                this.createElement('th', { class: 'table-header' }, 'State'),
                this.createElement('th', { class: 'table-header' }, 'Streets'),
                this.createElement('th', { class: 'table-header' }, 'Contacts'),
                this.createElement('th', { class: 'table-header' }, 'Status')
              ])
            ),
            this.createElement('tbody', {}, 
              neighborhoods.map(neighborhood => 
                this.createElement('tr', { 
                  class: `table-row ${selectedNeighborhoodId === neighborhood.id ? 'selected' : ''}`,
                  'data-neighborhood-id': neighborhood.id
                }, [
                  this.createElement('td', { class: 'table-cell' }, 
                    this.createElement('div', { class: 'neighborhood-name' }, neighborhood.name)
                  ),
                  this.createElement('td', { class: 'table-cell' }, neighborhood.city),
                  this.createElement('td', { class: 'table-cell' }, neighborhood.state),
                  this.createElement('td', { class: 'table-cell' }, neighborhood.streets),
                  this.createElement('td', { class: 'table-cell' }, neighborhood.contacts),
                  this.createElement('td', { class: 'table-cell' }, 
                    this.createElement('span', { 
                      class: `status-badge ${neighborhood.status.toLowerCase()}`
                    }, neighborhood.status)
                  )
                ])
              )
            )
          ])
      ])
    ]);
    
    this.shadowRoot.appendChild(container);
  }
}

// Register component
try {
  customElements.define('neighborhoods-list-view', neighborhoodsListView);
} catch (error) {
  console.warn('Error registering neighborhoods-list-view:', error);
}

export default neighborhoodsListView;