/**
 * SalesZonesListView.js
 * 
 * List view component for displaying and managing salesZones.
 * Shows zones in a tabular format with filtering and sorting options.
 */

import { BaseView } from '../components/BaseView.js';
import ViewState from '../services/ViewState.js';

export class SalesZonesListView extends BaseView {
  constructor() {
    super();
    this.viewState = ViewState;
    
    // Bind methods
    this.handleZoneSelect = this.handleZoneSelect.bind(this);
    this.handleAddZone = this.handleAddZone.bind(this);
    this.handleSort = this.handleSort.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      zones: [
        { 
          id: 1, 
          name: 'North Sales Zone', 
          type: 'Commercial',
          contacts: 32, 
          addresses: 120,
          lastActivity: '2 hours ago',
          status: 'Active'
        },
        { 
          id: 2, 
          name: 'Central Business District', 
          type: 'Mixed',
          contacts: 47, 
          addresses: 89,
          lastActivity: '1 day ago',
          status: 'Active'
        },
        { 
          id: 3, 
          name: 'South Residential', 
          type: 'Residential',
          contacts: 25, 
          addresses: 102,
          lastActivity: '3 days ago',
          status: 'Active'
        },
        { 
          id: 4, 
          name: 'East Industrial Park', 
          type: 'Industrial',
          contacts: 18, 
          addresses: 45,
          lastActivity: '1 week ago',
          status: 'Inactive'
        }
      ],
      selectedZoneId: null,
      searchQuery: '',
      sortField: 'name',
      sortDirection: 'asc',
      loading: false,
      error: null
    };
    
    // In a real implementation, we would fetch zone data from API
    // this.loadZones();
  }

  /**
   * Load zones data (would connect to API in real implementation)
   */
  async loadZones() {
    try {
      this.setState({ loading: true });
      
      // API calls would go here
      
      this.setState({ loading: false });
    } catch (error) {
      console.error('Error loading zones data:', error);
      this.setState({ 
        error: 'Failed to load zones data',
        loading: false
      });
    }
  }

  /**
   * Handle zone selection
   * @param {Event} event - Click event
   */
  handleZoneSelect(event) {
    const zoneRow = event.target.closest('[data-zone-id]');
    if (!zoneRow) return;
    
    const zoneId = parseInt(zoneRow.dataset.zoneId, 10);
    this.setState({ selectedZoneId: zoneId });
    
    // In a real implementation, this would navigate to the zone detail view
  }

  /**
   * Handle add zone button click
   */
  handleAddZone() {
    // In a real implementation, this would open a zone creation modal
    alert('Add zone functionality would open here');
  }

  /**
   * Handle table column sort
   * @param {Event} event - Click event
   */
  handleSort(event) {
    const sortHeader = event.target.closest('[data-sort]');
    if (!sortHeader) return;
    
    const field = sortHeader.dataset.sort;
    const { sortField, sortDirection } = this.getState();
    
    // Toggle direction if same field, or set ascending for new field
    const newDirection = (field === sortField) 
      ? (sortDirection === 'asc' ? 'desc' : 'asc')
      : 'asc';
    
    this.setState({ 
      sortField: field,
      sortDirection: newDirection
    });
    
    // Sort the zones
    this.sortZones(field, newDirection);
  }

  /**
   * Sort zones by field and direction
   * @param {string} field - Field to sort by
   * @param {string} direction - Sort direction ('asc' or 'desc')
   */
  sortZones(field, direction) {
    const { zones } = this.getState();
    
    const sortedZones = [...zones].sort((a, b) => {
      let valueA = a[field];
      let valueB = b[field];
      
      // Handle numeric values
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // Handle string values
      valueA = String(valueA).toLowerCase();
      valueB = String(valueB).toLowerCase();
      
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.setState({ zones: sortedZones });
  }

  /**
   * Handle search input
   * @param {Event} event - Input event
   */
  handleSearch(event) {
    const query = event.target.value;
    this.setState({ searchQuery: query });
    
    // In a real implementation, this would filter zones or trigger API search
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    // Zone selection
    const zonesTable = this.shadowRoot.querySelector('.zones-table');
    if (zonesTable) {
      this.addTrackedEventListener('click', this.handleZoneSelect, {}, zonesTable);
    }
    
    // Add zone button
    const addButton = this.shadowRoot.querySelector('.add-zone-button');
    if (addButton) {
      this.addTrackedEventListener('click', this.handleAddZone, {}, addButton);
    }
    
    // Sort headers
    const tableHeaders = this.shadowRoot.querySelector('.table-headers');
    if (tableHeaders) {
      this.addTrackedEventListener('click', this.handleSort, {}, tableHeaders);
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
      
      .sales-zones-list {
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
      
      .add-zone-button {
        background-color: #9CCB19; /* Lime Green */
        color: #1A3A59;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
      }
      
      .zones-table-container {
        flex: 1;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .zones-table {
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
        cursor: pointer;
        user-select: none;
      }
      
      .sort-indicator {
        display: inline-block;
        width: 0;
        height: 0;
        margin-left: 0.5rem;
        vertical-align: middle;
      }
      
      .sort-indicator.asc {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-bottom: 4px solid #666;
      }
      
      .sort-indicator.desc {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid #666;
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
      
      .zone-name {
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
      zones, 
      selectedZoneId, 
      searchQuery, 
      sortField, 
      sortDirection, 
      loading 
    } = this.getState();
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    const container = this.createElement('div', { class: 'sales-zones-list' }, [
      // List header
      this.createElement('div', { class: 'list-header' }, [
        this.createElement('div', { class: 'list-title' }, 'salesZones'),
        this.createElement('div', { class: 'list-controls' }, [
          this.createElement('div', { class: 'search-bar' }, 
            this.createElement('input', {
              type: 'text',
              class: 'search-input',
              placeholder: 'Search zones...',
              value: searchQuery
            })
          ),
          this.createElement('button', { class: 'add-zone-button' }, '+ Add Zone')
        ])
      ]),
      
      // Zones table
      this.createElement('div', { class: 'zones-table-container' }, [
        zones.length === 0 ?
          this.createElement('div', { class: 'empty-state' }, [
            loading ? this.createElement('div', { class: 'loading-spinner' }) : null,
            'No zones found. Create your first zone to get started.'
          ]) :
          this.createElement('table', { class: 'zones-table' }, [
            this.createElement('thead', { class: 'table-headers' }, 
              this.createElement('tr', {}, [
                this.createElement('th', { 
                  class: 'table-header',
                  'data-sort': 'name'
                }, [
                  'Name',
                  sortField === 'name' ? 
                    this.createElement('span', { 
                      class: `sort-indicator ${sortDirection}`
                    }) : null
                ]),
                this.createElement('th', { 
                  class: 'table-header',
                  'data-sort': 'type'
                }, [
                  'Type',
                  sortField === 'type' ? 
                    this.createElement('span', { 
                      class: `sort-indicator ${sortDirection}`
                    }) : null
                ]),
                this.createElement('th', { 
                  class: 'table-header',
                  'data-sort': 'contacts'
                }, [
                  'Contacts',
                  sortField === 'contacts' ? 
                    this.createElement('span', { 
                      class: `sort-indicator ${sortDirection}`
                    }) : null
                ]),
                this.createElement('th', { 
                  class: 'table-header',
                  'data-sort': 'addresses'
                }, [
                  'Addresses',
                  sortField === 'addresses' ? 
                    this.createElement('span', { 
                      class: `sort-indicator ${sortDirection}`
                    }) : null
                ]),
                this.createElement('th', { 
                  class: 'table-header',
                  'data-sort': 'lastActivity'
                }, [
                  'Last Activity',
                  sortField === 'lastActivity' ? 
                    this.createElement('span', { 
                      class: `sort-indicator ${sortDirection}`
                    }) : null
                ]),
                this.createElement('th', { 
                  class: 'table-header',
                  'data-sort': 'status'
                }, [
                  'Status',
                  sortField === 'status' ? 
                    this.createElement('span', { 
                      class: `sort-indicator ${sortDirection}`
                    }) : null
                ])
              ])
            ),
            this.createElement('tbody', {}, 
              zones.map(zone => 
                this.createElement('tr', { 
                  class: `table-row ${selectedZoneId === zone.id ? 'selected' : ''}`,
                  'data-zone-id': zone.id
                }, [
                  this.createElement('td', { class: 'table-cell' }, 
                    this.createElement('div', { class: 'zone-name' }, zone.name)
                  ),
                  this.createElement('td', { class: 'table-cell' }, zone.type),
                  this.createElement('td', { class: 'table-cell' }, zone.contacts),
                  this.createElement('td', { class: 'table-cell' }, zone.addresses),
                  this.createElement('td', { class: 'table-cell' }, zone.lastActivity),
                  this.createElement('td', { class: 'table-cell' }, 
                    this.createElement('span', { 
                      class: `status-badge ${zone.status.toLowerCase()}`
                    }, zone.status)
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
  customElements.define('sales-zones-list-view', SalesZonesListView);
} catch (error) {
  console.warn('Error registering sales-zones-list-view:', error);
}

export default SalesZonesListView;