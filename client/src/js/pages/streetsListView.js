/**
 * streetsListView.js
 * 
 * List view component for displaying and managing streets.
 */

import { BaseView } from '../components/BaseView.js';
import ViewState from '../services/ViewState.js';

export class streetsListView extends BaseView {
  constructor() {
    super();
    this.viewState = ViewState;
    
    // Bind methods
    this.handleStreetSelect = this.handleStreetSelect.bind(this);
    this.handleAddStreet = this.handleAddStreet.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleNeighborhoodFilter = this.handleNeighborhoodFilter.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      streets: [
        { 
          id: 1, 
          name: 'Main Street', 
          neighborhood: 'Downtown',
          city: 'Chicago',
          state: 'IL',
          addresses: 42,
          contacts: 68,
          lastActivity: '2 hours ago',
          status: 'Active'
        },
        { 
          id: 2, 
          name: 'Oak Avenue', 
          neighborhood: 'River North',
          city: 'Chicago',
          state: 'IL',
          addresses: 29,
          contacts: 37,
          lastActivity: '1 day ago',
          status: 'Active'
        },
        { 
          id: 3, 
          name: 'Cedar Lane', 
          neighborhood: 'Lincoln Park',
          city: 'Chicago',
          state: 'IL', 
          addresses: 18,
          contacts: 25,
          lastActivity: '3 days ago',
          status: 'Active'
        },
        { 
          id: 4, 
          name: 'Maple Drive', 
          neighborhood: 'Wicker Park',
          city: 'Chicago',
          state: 'IL',
          addresses: 33,
          contacts: 45,
          lastActivity: '1 week ago',
          status: 'Inactive'
        }
      ],
      neighborhoods: [
        { id: 1, name: 'Downtown' },
        { id: 2, name: 'River North' },
        { id: 3, name: 'Lincoln Park' },
        { id: 4, name: 'Wicker Park' }
      ],
      selectedStreetId: null,
      selectedNeighborhoodId: null,
      searchQuery: '',
      loading: false,
      error: null
    };
    
    // In a real implementation, we would fetch street data from API
    // this.loadStreets();
  }

  /**
   * Load streets data (would connect to API in real implementation)
   */
  async loadStreets() {
    try {
      this.setState({ loading: true });
      
      // API calls would go here
      
      this.setState({ loading: false });
    } catch (error) {
      console.error('Error loading streets data:', error);
      this.setState({ 
        error: 'Failed to load streets data',
        loading: false
      });
    }
  }

  /**
   * Handle street selection
   * @param {Event} event - Click event
   */
  handleStreetSelect(event) {
    const streetRow = event.target.closest('[data-street-id]');
    if (!streetRow) return;
    
    const streetId = parseInt(streetRow.dataset.streetId, 10);
    this.setState({ selectedStreetId: streetId });
    
    // In a real implementation, this would navigate to the street detail view
  }

  /**
   * Handle add street button click
   */
  handleAddStreet() {
    // In a real implementation, this would open a street creation modal
    alert('Add street functionality would open here');
  }

  /**
   * Handle search input
   * @param {Event} event - Input event
   */
  handleSearch(event) {
    const query = event.target.value;
    this.setState({ searchQuery: query });
    
    // In a real implementation, this would filter streets or trigger API search
  }

  /**
   * Handle neighborhood filter selection
   * @param {Event} event - Change event
   */
  handleNeighborhoodFilter(event) {
    const neighborhoodId = event.target.value ? parseInt(event.target.value, 10) : null;
    this.setState({ selectedNeighborhoodId: neighborhoodId });
    
    // In a real implementation, this would filter streets by neighborhood
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    // Street selection
    const streetsTable = this.shadowRoot.querySelector('.streets-table');
    if (streetsTable) {
      this.addTrackedEventListener('click', this.handleStreetSelect, {}, streetsTable);
    }
    
    // Add street button
    const addButton = this.shadowRoot.querySelector('.add-street-button');
    if (addButton) {
      this.addTrackedEventListener('click', this.handleAddStreet, {}, addButton);
    }
    
    // Search input
    const searchInput = this.shadowRoot.querySelector('.search-input');
    if (searchInput) {
      this.addTrackedEventListener('input', this.handleSearch, {}, searchInput);
    }
    
    // Neighborhood filter
    const neighborhoodFilter = this.shadowRoot.querySelector('.neighborhood-filter');
    if (neighborhoodFilter) {
      this.addTrackedEventListener('change', this.handleNeighborhoodFilter, {}, neighborhoodFilter);
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
      
      .streets-list {
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
      
      .neighborhood-filter {
        padding: 0.5rem 0.75rem;
        border-radius: 4px;
        border: 1px solid #ddd;
        min-width: 200px;
      }
      
      .add-street-button {
        background-color: #9CCB19; /* Lime Green */
        color: #1A3A59;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
      }
      
      .streets-table-container {
        flex: 1;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .streets-table {
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
      
      .street-name {
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
      streets, 
      neighborhoods,
      selectedStreetId,
      selectedNeighborhoodId,
      searchQuery, 
      loading 
    } = this.getState();
    
    // Filter streets by neighborhood if selected
    const filteredStreets = selectedNeighborhoodId
      ? streets.filter(street => {
          const neighborhood = neighborhoods.find(n => n.id === selectedNeighborhoodId);
          return street.neighborhood === neighborhood?.name;
        })
      : streets;
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    const container = this.createElement('div', { class: 'streets-list' }, [
      // List header
      this.createElement('div', { class: 'list-header' }, [
        this.createElement('div', { class: 'list-title' }, 'streets'),
        this.createElement('div', { class: 'list-controls' }, [
          this.createElement('select', { 
            class: 'neighborhood-filter',
            value: selectedNeighborhoodId || ''
          }, [
            this.createElement('option', { value: '' }, 'All Neighborhoods'),
            ...neighborhoods.map(neighborhood => 
              this.createElement('option', { 
                value: neighborhood.id,
                selected: selectedNeighborhoodId === neighborhood.id
              }, neighborhood.name)
            )
          ]),
          this.createElement('div', { class: 'search-bar' }, 
            this.createElement('input', {
              type: 'text',
              class: 'search-input',
              placeholder: 'Search streets...',
              value: searchQuery
            })
          ),
          this.createElement('button', { class: 'add-street-button' }, '+ Add Street')
        ])
      ]),
      
      // Streets table
      this.createElement('div', { class: 'streets-table-container' }, [
        filteredStreets.length === 0 ?
          this.createElement('div', { class: 'empty-state' }, [
            loading ? this.createElement('div', { class: 'loading-spinner' }) : null,
            selectedNeighborhoodId 
              ? 'No streets found in this neighborhood. Add some streets to get started.'
              : 'No streets found. Create your first street to get started.'
          ]) :
          this.createElement('table', { class: 'streets-table' }, [
            this.createElement('thead', { class: 'table-headers' }, 
              this.createElement('tr', {}, [
                this.createElement('th', { class: 'table-header' }, 'Name'),
                this.createElement('th', { class: 'table-header' }, 'Neighborhood'),
                this.createElement('th', { class: 'table-header' }, 'City'),
                this.createElement('th', { class: 'table-header' }, 'Addresses'),
                this.createElement('th', { class: 'table-header' }, 'Contacts'),
                this.createElement('th', { class: 'table-header' }, 'Last Activity'),
                this.createElement('th', { class: 'table-header' }, 'Status')
              ])
            ),
            this.createElement('tbody', {}, 
              filteredStreets.map(street => 
                this.createElement('tr', { 
                  class: `table-row ${selectedStreetId === street.id ? 'selected' : ''}`,
                  'data-street-id': street.id
                }, [
                  this.createElement('td', { class: 'table-cell' }, 
                    this.createElement('div', { class: 'street-name' }, street.name)
                  ),
                  this.createElement('td', { class: 'table-cell' }, street.neighborhood),
                  this.createElement('td', { class: 'table-cell' }, `${street.city}, ${street.state}`),
                  this.createElement('td', { class: 'table-cell' }, street.addresses),
                  this.createElement('td', { class: 'table-cell' }, street.contacts),
                  this.createElement('td', { class: 'table-cell' }, street.lastActivity),
                  this.createElement('td', { class: 'table-cell' }, 
                    this.createElement('span', { 
                      class: `status-badge ${street.status.toLowerCase()}`
                    }, street.status)
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
  customElements.define('streets-list-view', streetsListView);
} catch (error) {
  console.warn('Error registering streets-list-view:', error);
}

export default streetsListView;