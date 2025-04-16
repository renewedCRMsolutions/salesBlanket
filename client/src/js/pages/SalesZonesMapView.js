/**
 * salesZonesMapView.js
 * 
 * Map view component for displaying and managing salesZones.
 * Integrates with Google Maps to show geographic zones.
 */

import { BaseView } from '../components/BaseView.js';
import ViewState from '../services/ViewState.js';

export class salesZonesMapView extends BaseView {
  constructor() {
    super();
    this.viewState = ViewState;
    
    // Bind methods
    this.handleZoneSelect = this.handleZoneSelect.bind(this);
    this.handleAddZone = this.handleAddZone.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      zones: [
        { id: 1, name: 'North Sales Zone', color: '#3B7B9E', contacts: 32, addresses: 120 },
        { id: 2, name: 'Central Business District', color: '#2D4A71', contacts: 47, addresses: 89 },
        { id: 3, name: 'South Residential', color: '#9CCB19', contacts: 25, addresses: 102 }
      ],
      selectedZoneId: null,
      mapLoaded: false,
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
    const zoneItem = event.target.closest('[data-zone-id]');
    if (!zoneItem) return;
    
    const zoneId = parseInt(zoneItem.dataset.zoneId, 10);
    this.setState({ selectedZoneId: zoneId });
    
    // In a real implementation, this would center the map on the selected zone
  }

  /**
   * Handle add zone button click
   */
  handleAddZone() {
    // In a real implementation, this would open a zone creation modal
    alert('Add zone functionality would open here');
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    // Zone selection
    const zonesList = this.shadowRoot.querySelector('.zones-list');
    if (zonesList) {
      this.addTrackedEventListener('click', this.handleZoneSelect, {}, zonesList);
    }
    
    // Add zone button
    const addButton = this.shadowRoot.querySelector('.add-zone-button');
    if (addButton) {
      this.addTrackedEventListener('click', this.handleAddZone, {}, addButton);
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
      
      .sales-zones-map {
        display: flex;
        height: 100%;
      }
      
      .zones-sidebar {
        width: 300px;
        background-color: white;
        border-right: 1px solid #eee;
        display: flex;
        flex-direction: column;
      }
      
      .sidebar-header {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .sidebar-title {
        font-weight: bold;
        font-size: 1.1rem;
        color: #2F4F2F; /* Brewster Green */
      }
      
      .add-zone-button {
        background-color: #9CCB19; /* Lime Green */
        color: white;
        border: none;
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
      }
      
      .zones-list {
        flex: 1;
        overflow-y: auto;
        padding: 0.5rem;
      }
      
      .zone-item {
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: background-color 0.2s;
        border-left: 4px solid #eee;
      }
      
      .zone-item:hover {
        background-color: #f5f5f5;
      }
      
      .zone-item.selected {
        background-color: #f5f5f5;
        border-left-color: #2F4F2F; /* Brewster Green */
      }
      
      .zone-name {
        font-weight: 500;
        margin-bottom: 0.25rem;
      }
      
      .zone-stats {
        font-size: 0.85rem;
        color: #666;
        display: flex;
        gap: 0.5rem;
      }
      
      .map-container {
        flex: 1;
        background-color: #f5f5f5;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .map-placeholder {
        color: #666;
        text-align: center;
        max-width: 300px;
      }
      
      .loading-spinner {
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
    const { zones, selectedZoneId, mapLoaded, loading } = this.getState();
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    const container = this.createElement('div', { class: 'sales-zones-map' }, [
      // Zones sidebar
      this.createElement('div', { class: 'zones-sidebar' }, [
        this.createElement('div', { class: 'sidebar-header' }, [
          this.createElement('div', { class: 'sidebar-title' }, 'salesZones'),
          this.createElement('button', { class: 'add-zone-button' }, '+ Add Zone')
        ]),
        this.createElement('div', { class: 'zones-list' }, 
          zones.map(zone => 
            this.createElement('div', { 
              class: `zone-item ${selectedZoneId === zone.id ? 'selected' : ''}`,
              'data-zone-id': zone.id,
              style: `border-left-color: ${zone.color};`
            }, [
              this.createElement('div', { class: 'zone-name' }, zone.name),
              this.createElement('div', { class: 'zone-stats' }, [
                this.createElement('span', {}, `${zone.contacts} Contacts`),
                this.createElement('span', {}, `${zone.addresses} Addresses`)
              ])
            ])
          )
        )
      ]),
      
      // Map container
      this.createElement('div', { class: 'map-container', id: 'map' }, [
        !mapLoaded ? 
          this.createElement('div', { class: 'map-placeholder' }, [
            loading ? 
              this.createElement('div', { class: 'loading-spinner' }) : 
              'Google Maps will be loaded here to display sales zones with their boundaries and entities.'
          ]) : null
      ])
    ]);
    
    this.shadowRoot.appendChild(container);
    
    // In a real implementation, we would initialize Google Maps here
    // this.initMap();
  }

  /**
   * Initialize Google Maps
   * This would be implemented in a real application
   */
  initMap() {
    // Google Maps initialization code would go here
  }
}

// Register component
try {
  customElements.define('sales-zones-map-view', SalesZonesMapView);
} catch (error) {
  console.warn('Error registering sales-zones-map-view:', error);
}

export default salesZonesMapView;