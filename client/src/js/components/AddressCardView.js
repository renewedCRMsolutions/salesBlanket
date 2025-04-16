/**
 * AddressCardView.js
 * 
 * Component for displaying address cards in various contexts.
 */

import { BaseView } from './BaseView.js';
import ViewState from '../services/ViewState.js';

export class AddressCardView extends BaseView {
  static get observedAttributes() {
    return ['address-id', 'card-type', 'view-mode'];
  }

  constructor() {
    super();
    this.viewState = ViewState;
    
    // Bind methods
    this.handleDetailView = this.handleDetailView.bind(this);
    this.handleKnock = this.handleKnock.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      address: null,
      loading: true,
      viewMode: this.getAttribute('view-mode') || 'compact',
      cardType: this.getAttribute('card-type') || 'new',
      error: null
    };
    
    const addressId = this.getAttribute('address-id');
    if (addressId) {
      this.loadAddress(addressId);
    }
  }

  /**
   * Handle attribute changes
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'address-id' && newValue) {
      this.loadAddress(newValue);
    } else if (name === 'card-type' || name === 'view-mode') {
      this.setState({
        [name === 'card-type' ? 'cardType' : 'viewMode']: newValue
      });
    }
  }

  /**
   * Load address data (simulated for now)
   */
  loadAddress(addressId) {
    this.setState({ loading: true });
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock data
      const addressData = {
        id: addressId,
        name: 'Chicago HQ',
        street: '100 Michigan Ave',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        type: 'headquarters',
        assigned: {
          rep: 'Jane Smith',
          date: '2025-03-15'
        },
        status: {
          lastVisit: '2025-03-27',
          nextVisit: '2025-04-10'
        },
        contact: {
          name: 'Daniel Kozlowski',
          email: 'daniel@example.com',
          phone: '312-555-1234'
        }
      };
      
      this.setState({
        address: addressData,
        loading: false
      });
    }, 300);
  }

  /**
   * Handle detail view click
   */
  handleDetailView() {
    const { address } = this.getState();
    if (!address) return;
    
    // Set as active entity in view state
    this.viewState.updateState({
      activeEntityId: address.id,
      activeEntity: address
    });
    
    // Dispatch custom event
    this.dispatchEvent(
      new CustomEvent('address-view-details', {
        detail: { address },
        bubbles: true,
        composed: true
      })
    );
  }

  /**
   * Handle knock button click
   */
  handleKnock() {
    const { address } = this.getState();
    if (!address) return;
    
    // Dispatch custom event
    this.dispatchEvent(
      new CustomEvent('address-knock', {
        detail: { address },
        bubbles: true,
        composed: true
      })
    );
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    const detailBtn = this.shadowRoot.querySelector('.detail-button');
    if (detailBtn) {
      this.addTrackedEventListener('click', this.handleDetailView, {}, detailBtn);
    }
    
    const knockBtn = this.shadowRoot.querySelector('.knock-button');
    if (knockBtn) {
      this.addTrackedEventListener('click', this.handleKnock, {}, knockBtn);
    }
  }

  /**
   * Define component styles
   * @returns {string} Component CSS
   */
  getStyles() {
    return `
      ${super.getStyles()}
      
      :host {
        display: block;
        margin-bottom: 1rem;
      }
      
      .address-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        overflow: hidden;
      }
      
      .card-header {
        padding: 0.75rem;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .card-header-new {
        background-color: #9933CC; /* Purple for New Addresses */
        color: white;
      }
      
      .card-header-knock {
        background-color: #3B7B9E; /* Fjord */
        color: white;
      }
      
      .card-header-scheduled {
        background-color: #1E4A43; /* Eberle Green */
        color: white;
      }
      
      .card-header-goback {
        background-color: #FFC20E; /* Racing Yellow */
        color: #1A3A59;
      }
      
      .card-count {
        background-color: rgba(255,255,255,0.3);
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
      }
      
      .card-content {
        padding: 1rem;
      }
      
      .address-name {
        font-weight: bold;
        font-size: 1.1rem;
        margin-bottom: 0.25rem;
      }
      
      .address-street {
        margin-bottom: 0.25rem;
      }
      
      .address-citystate {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 0.75rem;
      }
      
      .card-metadata {
        font-size: 0.85rem;
        color: #666;
        margin: 0.5rem 0;
      }
      
      .card-metadata-label {
        font-weight: bold;
        display: inline-block;
        width: 100px;
      }
      
      .card-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
      }
      
      .detail-button {
        background-color: #FFC20E; /* Racing Yellow */
        flex: 1;
        border: none;
        padding: 0.5rem;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        color: #1A3A59;
      }
      
      .knock-button {
        background-color: #1A3A59; /* Golf Blau */
        flex: 2;
        border: none;
        padding: 0.5rem;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        color: white;
      }
      
      .card-badge {
        display: inline-block;
        margin-right: 0.3rem;
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }
      
      .badge-fire {
        background-color: #960018; /* Carmine Red */
      }
      
      .badge-water {
        background-color: #3B7B9E; /* Fjord */  
      }
      
      .badge-ice {
        background-color: #C9C8C0; /* Chalk */
      }
      
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 4px;
        height: 1rem;
        margin-bottom: 0.5rem;
      }
      
      .skeleton-title {
        height: 1.2rem;
        width: 70%;
      }
      
      .skeleton-text {
        height: 1rem;
        width: 100%;
      }
      
      .skeleton-text-short {
        height: 1rem;
        width: 60%;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
  }

  /**
   * Render loading skeleton
   * @returns {HTMLElement} Skeleton DOM element
   */
  renderSkeleton() {
    return this.createElement('div', { class: 'address-card' }, [
      this.createElement('div', { 
        class: `card-header card-header-${this.getState().cardType}` 
      }, [
        'Loading...',
        this.createElement('span', { class: 'card-count' }, '...')
      ]),
      this.createElement('div', { class: 'card-content' }, [
        this.createElement('div', { class: 'skeleton skeleton-title' }),
        this.createElement('div', { class: 'skeleton skeleton-text' }),
        this.createElement('div', { class: 'skeleton skeleton-text-short' }),
        this.createElement('div', { class: 'card-actions' }, [
          this.createElement('button', { class: 'detail-button' }, 'Detail View'),
          this.createElement('button', { class: 'knock-button' }, 'KNOCK')
        ])
      ])
    ]);
  }

  /**
   * Render component template
   */
  render() {
    const { address, loading, cardType, viewMode, error } = this.getState();
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    if (loading) {
      this.shadowRoot.appendChild(this.renderSkeleton());
      return;
    }
    
    if (error) {
      this.shadowRoot.appendChild(
        this.createElement('div', { class: 'error-message' }, 
          `Error loading address: ${error}`
        )
      );
      return;
    }
    
    if (!address) {
      this.shadowRoot.appendChild(
        this.createElement('div', { class: 'error-message' }, 
          'No address data available'
        )
      );
      return;
    }
    
    const cardContent = this.createElement('div', { class: 'card-content' }, [
      this.createElement('div', { class: 'address-name' }, address.name),
      this.createElement('div', { class: 'address-street' }, address.street),
      this.createElement('div', { class: 'address-citystate' }, 
        `${address.city}, ${address.state} ${address.zip}`
      )
    ]);
    
    // Add metadata if in detailed view mode
    if (viewMode === 'detailed') {
      cardContent.appendChild(
        this.createElement('div', { class: 'card-metadata-section' }, [
          this.createElement('div', { class: 'card-metadata' }, [
            this.createElement('span', { class: 'card-metadata-label' }, 'Rep Assigned:'),
            address.assigned?.rep || 'Unassigned'
          ]),
          this.createElement('div', { class: 'card-metadata' }, [
            this.createElement('span', { class: 'card-metadata-label' }, 'Last Contact:'),
            address.status?.lastVisit || 'None'
          ]),
          this.createElement('div', { class: 'card-metadata' }, [
            this.createElement('span', { class: 'card-metadata-label' }, 'Next Visit:'),
            address.status?.nextVisit || 'Not scheduled'
          ])
        ])
      );
    }
    
    // Add action buttons
    cardContent.appendChild(
      this.createElement('div', { class: 'card-actions' }, [
        this.createElement('button', { class: 'detail-button' }, 'Detail View'),
        this.createElement('button', { class: 'knock-button' }, 'KNOCK')
      ])
    );
    
    const card = this.createElement('div', { class: 'address-card' }, [
      this.createElement('div', { 
        class: `card-header card-header-${cardType}` 
      }, [
        cardType === 'new' ? 'New Addresses' : 
        cardType === 'knock' ? 'Knock List' : 
        cardType === 'scheduled' ? 'Scheduled' : 
        'Go Back',
        this.createElement('span', { class: 'card-count' }, '1')
      ]),
      cardContent
    ]);
    
    this.shadowRoot.appendChild(card);
  }
}

// Register the component
if (!customElements.get('address-card')) {
  customElements.define('address-card', AddressCardView);
}

export default AddressCardView;