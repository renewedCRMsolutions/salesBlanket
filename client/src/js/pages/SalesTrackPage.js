/**
 * SalesTrackPage.js
 * 
 * Page component for the Sales Track system.
 */

import { BaseView } from '../components/BaseView.js';
import '../components/SalesTrackView.js';

export class SalesTrackPage extends BaseView {
  constructor() {
    super();
    
    // Bind methods
    this.handleEntitySelected = this.handleEntitySelected.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      selectedEntityId: null,
      selectedEntityType: null
    };
  }

  /**
   * Handle entity selection
   * @param {CustomEvent} event - Entity selected event
   */
  handleEntitySelected(event) {
    const { entityId, entityType } = event.detail;
    this.setState({
      selectedEntityId: entityId,
      selectedEntityType: entityType
    });
    
    console.log(`Selected entity: ${entityId} (${entityType})`);
    
    // In a real implementation, this would open the entity card or view
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    // Listen for entity selection events
    this.addTrackedEventListener('entity-selected', this.handleEntitySelected);
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
      
      .sales-track-page {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      
      .page-header {
        padding: 1rem;
        background-color: #2F4F2F; /* Brewster Green */
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .page-title {
        font-size: 1.5rem;
        font-weight: bold;
      }
      
      .page-actions {
        display: flex;
        gap: 0.5rem;
      }
      
      .action-button {
        padding: 0.5rem 1rem;
        background-color: #9CCB19; /* Lime Green */
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
      }
      
      .page-content {
        flex: 1;
        overflow: hidden;
      }
    `;
  }

  /**
   * Render component
   */
  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    const container = this.createElement('div', { class: 'sales-track-page' }, [
      // Page header
      this.createElement('div', { class: 'page-header' }, [
        this.createElement('div', { class: 'page-title' }, 'Sales Tracks'),
        this.createElement('div', { class: 'page-actions' }, [
          this.createElement('button', { class: 'action-button' }, 'New Track'),
          this.createElement('button', { class: 'action-button' }, 'Manage Stops')
        ])
      ]),
      
      // Main content
      this.createElement('div', { class: 'page-content' }, [
        this.createElement('sales-track-view', {})
      ])
    ]);
    
    this.shadowRoot.appendChild(container);
  }
}

// Register component
if (!customElements.get('sales-track-page')) {
  customElements.define('sales-track-page', SalesTrackPage);
}

export default SalesTrackPage;