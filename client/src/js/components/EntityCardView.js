/**
 * EntityCardView.js
 * 
 * Base component for all entity cards in SalesBlanket.
 * Displays entity information based on card layout.
 */

import { BaseView } from './BaseView.js';
import ViewState from '../services/ViewState.js';

export class EntityCardView extends BaseView {
  static get observedAttributes() {
    return ['entity-id', 'entity-type', 'card-layout', 'view-mode'];
  }

  constructor() {
    super();
    this.viewState = ViewState;
    
    // Bind methods
    this.handleViewDetails = this.handleViewDetails.bind(this);
    this.handleActionClick = this.handleActionClick.bind(this);
    this.handlePulseSelect = this.handlePulseSelect.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      entity: null,
      entityType: this.getAttribute('entity-type') || 'address',
      cardLayout: this.getAttribute('card-layout') || 'default',
      viewMode: this.getAttribute('view-mode') || 'compact',
      pulseComponents: [],
      activePulseComponent: null,
      loading: true,
      error: null
    };
    
    const entityId = this.getAttribute('entity-id');
    if (entityId) {
      this.loadEntity(entityId);
    }
  }

  /**
   * Handle attribute changes
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'entity-id' && newValue) {
      this.loadEntity(newValue);
    } else if (['entity-type', 'card-layout', 'view-mode'].includes(name)) {
      this.setState({
        [name === 'entity-type' ? 'entityType' : 
         name === 'card-layout' ? 'cardLayout' : 'viewMode']: newValue
      });
    }
  }

  /**
   * Load entity data (simulated for now)
   */
  loadEntity(entityId) {
    this.setState({ loading: true });
    
    // Simulate API call delay
    setTimeout(() => {
      // Mock entity data based on entity type
      const entityData = this.getMockEntity(entityId, this.getState().entityType);
      
      // Mock pulse components
      const pulseComponents = [
        { id: 1, type: 'photos', label: 'Photos', icon: '📷' },
        { id: 2, type: 'contacts', label: 'Contacts', icon: '👤' },
        { id: 3, type: 'notes', label: 'Notes', icon: '📝' },
        { id: 4, type: 'activity', label: 'Activity History', icon: '📊' },
        { id: 5, type: 'details', label: 'Details', icon: 'ℹ️' }
      ];
      
      this.setState({
        entity: entityData,
        pulseComponents,
        activePulseComponent: pulseComponents[0],
        loading: false
      });
    }, 300);
  }

  /**
   * Get mock entity data
   */
  getMockEntity(entityId, entityType) {
    switch (entityType) {
      case 'address':
        return {
          id: entityId,
          type: 'address',
          name: 'Chicago HQ',
          street: '100 Michigan Ave',
          city: 'Chicago',
          state: 'IL',
          zip: '60601',
          entityType: 'headquarters',
          assigned: {
            rep: 'Jane Smith',
            date: '2025-03-15'
          },
          status: {
            lastVisit: '2025-03-27',
            nextVisit: '2025-04-10'
          },
          pulse: {
            photos: [],
            contacts: [
              { id: 1, name: 'Daniel Kozlowski', email: 'dkozlowski@gmail.com' },
              { id: 2, name: 'Robert Wolfe', email: 'robert@allequareroofing.com' }
            ],
            notes: [
              { id: 1, text: 'Next knock date: 3/27/2025', date: '2025-03-15' }
            ]
          }
        };
        
      case 'contact':
        return {
          id: entityId,
          type: 'contact',
          name: 'Robert Wolfe',
          email: 'robert@allequareroofing.com',
          phone: '1-800-555-1234',
          address: '5252 william st, Lancaster, NY 14086-9658',
          entityType: 'customer',
          assigned: {
            rep: 'Jane Smith',
            date: '2025-03-15'
          },
          status: {
            lastContact: '2025-03-20',
            nextContact: '2025-04-05'
          },
          pulse: {
            photos: [],
            notes: [
              { id: 1, text: 'Interested in roofing services', date: '2025-03-15' }
            ]
          }
        };
        
      case 'opportunity':
        return {
          id: entityId,
          type: 'opportunity',
          name: 'Roofing Project',
          value: 12500,
          status: 'Qualified',
          probability: 75,
          entityType: 'project',
          contact: { id: 2, name: 'Robert Wolfe' },
          address: { id: 5, name: '5252 william st' },
          assigned: {
            rep: 'Jane Smith',
            date: '2025-03-15'
          },
          pulse: {
            photos: [],
            notes: [
              { id: 1, text: 'Needs estimate for storm damage repair', date: '2025-03-15' }
            ]
          }
        };
        
      default:
        return {
          id: entityId,
          type: entityType,
          name: `Entity ${entityId}`,
          entityType: 'generic'
        };
    }
  }

  /**
   * Handle view details click
   */
  handleViewDetails() {
    const { entity } = this.getState();
    if (!entity) return;
    
    // Set as active entity in view state
    this.viewState.updateState({
      activeEntityId: entity.id,
      activeEntityType: entity.type,
      activeEntity: entity
    });
    
    // Dispatch custom event
    this.dispatchEvent(
      new CustomEvent('entity-view-details', {
        detail: { entity },
        bubbles: true,
        composed: true
      })
    );
  }

  /**
   * Handle action button click
   * @param {Event} event - Click event
   */
  handleActionClick(event) {
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;
    
    const { entity } = this.getState();
    if (!entity) return;
    
    const action = actionButton.dataset.action;
    
    // Dispatch custom event for action
    this.dispatchEvent(
      new CustomEvent(`entity-action-${action}`, {
        detail: { entity, action },
        bubbles: true,
        composed: true
      })
    );
  }

  /**
   * Handle pulse component selection
   * @param {Event} event - Click event
   */
  handlePulseSelect(event) {
    const pulseTab = event.target.closest('[data-pulse-type]');
    if (!pulseTab) return;
    
    const pulseType = pulseTab.dataset.pulseType;
    const { pulseComponents } = this.getState();
    
    const activePulseComponent = pulseComponents.find(p => p.type === pulseType);
    if (activePulseComponent) {
      this.setState({ activePulseComponent });
    }
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    // View details button
    const detailsBtn = this.shadowRoot.querySelector('.card-view-button');
    if (detailsBtn) {
      this.addTrackedEventListener('click', this.handleViewDetails, {}, detailsBtn);
    }
    
    // Action buttons
    const actionsContainer = this.shadowRoot.querySelector('.card-actions');
    if (actionsContainer) {
      this.addTrackedEventListener('click', this.handleActionClick, {}, actionsContainer);
    }
    
    // Pulse tabs
    const pulseTabs = this.shadowRoot.querySelector('.pulse-tabs');
    if (pulseTabs) {
      this.addTrackedEventListener('click', this.handlePulseSelect, {}, pulseTabs);
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
      
      .entity-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        overflow: hidden;
      }
      
      .card-header {
        padding: 1rem;
        font-weight: bold;
        background-color: var(--card-header-color, #2F4F2F);
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .card-content {
        padding: 1rem;
      }
      
      .entity-name {
        font-weight: bold;
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
      }
      
      .entity-meta {
        margin-bottom: 0.75rem;
        font-size: 0.9rem;
      }
      
      .meta-item {
        margin-bottom: 0.25rem;
      }
      
      .card-actions {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
      }
      
      .card-button {
        flex: 1;
        padding: 0.5rem;
        border: none;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        text-align: center;
      }
      
      .card-view-button {
        background-color: #FFC20E; /* Racing Yellow */
        color: #1A3A59;
      }
      
      .card-primary-button {
        background-color: #1A3A59; /* Golf Blau */
        color: white;
      }
      
      /* Pulse Components */
      .pulse-container {
        margin-top: 1rem;
        border-top: 1px solid rgba(0,0,0,0.1);
      }
      
      .pulse-tabs {
        display: flex;
        border-bottom: 1px solid rgba(0,0,0,0.1);
        background-color: #f5f5f5;
      }
      
      .pulse-tab {
        padding: 0.75rem 1rem;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        font-weight: 500;
        font-size: 0.9rem;
        transition: all 0.2s;
      }
      
      .pulse-tab.active {
        border-bottom-color: #2F4F2F;
        background-color: white;
      }
      
      .pulse-tab:hover:not(.active) {
        background-color: rgba(0,0,0,0.05);
      }
      
      .pulse-content {
        padding: 1rem;
        min-height: 100px;
      }
      
      /* Entity Type Specific Styles */
      .entity-card[data-entity-type="address"] {
        --card-header-color: #3B7B9E; /* Fjord */
      }
      
      .entity-card[data-entity-type="contact"] {
        --card-header-color: #2D4A71; /* Shark Blue */
      }
      
      .entity-card[data-entity-type="opportunity"] {
        --card-header-color: #9CCB19; /* Lime Green */
      }
      
      /* Card Layout Variations */
      .entity-card[data-card-layout="compact"] .pulse-container {
        display: none;
      }
      
      .entity-card[data-card-layout="basic"] .entity-meta {
        display: none;
      }
      
      /* Empty States */
      .pulse-empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        color: #777;
        text-align: center;
      }
      
      .empty-icon {
        font-size: 2rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }
      
      /* Loading States */
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
   * Render the pulse content based on active component
   * @returns {HTMLElement} Pulse content element
   */
  renderPulseContent() {
    const { entity, activePulseComponent } = this.getState();
    
    if (!activePulseComponent) {
      return this.createElement('div', { class: 'pulse-empty-state' }, 
        'Select a pulse component'
      );
    }
    
    // Get pulse data from entity
    const pulseData = entity?.pulse?.[activePulseComponent.type] || [];
    
    switch (activePulseComponent.type) {
      case 'photos':
        return this.renderPhotosPulse(pulseData);
      case 'contacts':
        return this.renderContactsPulse(pulseData);
      case 'notes':
        return this.renderNotesPulse(pulseData);
      case 'activity':
        return this.renderActivityPulse(pulseData);
      case 'details':
        return this.renderDetailsPulse(entity);
      default:
        return this.createElement('div', { class: 'pulse-content' }, 
          `${activePulseComponent.label} content will display here`
        );
    }
  }

  /**
   * Render photos pulse content
   * @param {Array} photos - Photo data
   * @returns {HTMLElement} Photos content element
   */
  renderPhotosPulse(photos) {
    if (!photos || photos.length === 0) {
      return this.createElement('div', { class: 'pulse-empty-state' }, [
        this.createElement('div', { class: 'empty-icon' }, '📷'),
        this.createElement('div', { class: 'empty-text' }, 'No photos available'),
        this.createElement('button', { class: 'card-button card-view-button' }, 'Add Photo')
      ]);
    }
    
    return this.createElement('div', { class: 'pulse-content photos-content' },
      photos.map(photo => 
        this.createElement('div', { class: 'photo-item' }, [
          this.createElement('img', { src: photo.url, alt: photo.caption }),
          this.createElement('div', { class: 'photo-caption' }, photo.caption)
        ])
      )
    );
  }

  /**
   * Render contacts pulse content
   * @param {Array} contacts - Contact data
   * @returns {HTMLElement} Contacts content element
   */
  renderContactsPulse(contacts) {
    if (!contacts || contacts.length === 0) {
      return this.createElement('div', { class: 'pulse-empty-state' }, [
        this.createElement('div', { class: 'empty-icon' }, '👤'),
        this.createElement('div', { class: 'empty-text' }, 'No contacts available'),
        this.createElement('button', { class: 'card-button card-view-button' }, 'Add Contact')
      ]);
    }
    
    return this.createElement('div', { class: 'pulse-content contacts-content' },
      contacts.map(contact => 
        this.createElement('div', { class: 'contact-item' }, [
          this.createElement('div', { class: 'contact-name' }, contact.name),
          this.createElement('div', { class: 'contact-email' }, contact.email || 'N/A'),
          this.createElement('div', { class: 'contact-actions' }, [
            this.createElement('button', { class: 'card-button card-view-button' }, 'Edit'),
            this.createElement('button', { class: 'card-button card-primary-button' }, 'View')
          ])
        ])
      )
    );
  }

  /**
   * Render notes pulse content
   * @param {Array} notes - Notes data
   * @returns {HTMLElement} Notes content element
   */
  renderNotesPulse(notes) {
    if (!notes || notes.length === 0) {
      return this.createElement('div', { class: 'pulse-empty-state' }, [
        this.createElement('div', { class: 'empty-icon' }, '📝'),
        this.createElement('div', { class: 'empty-text' }, 'No notes available'),
        this.createElement('button', { class: 'card-button card-view-button' }, 'Add Note')
      ]);
    }
    
    return this.createElement('div', { class: 'pulse-content notes-content' },
      notes.map(note => 
        this.createElement('div', { class: 'note-item' }, [
          this.createElement('div', { class: 'note-text' }, note.text),
          this.createElement('div', { class: 'note-date' }, new Date(note.date).toLocaleDateString())
        ])
      )
    );
  }

  /**
   * Render activity pulse content
   * @param {Array} activities - Activity data
   * @returns {HTMLElement} Activity content element
   */
  renderActivityPulse(activities) {
    return this.createElement('div', { class: 'pulse-empty-state' }, [
      this.createElement('div', { class: 'empty-icon' }, '📊'),
      this.createElement('div', { class: 'empty-text' }, 'Activity history will be shown here'),
    ]);
  }

  /**
   * Render details pulse content
   * @param {Object} entity - Entity data
   * @returns {HTMLElement} Details content element
   */
  renderDetailsPulse(entity) {
    if (!entity) return null;
    
    const details = [];
    
    // Add details based on entity type
    if (entity.type === 'address') {
      details.push(
        { label: 'Street', value: entity.street },
        { label: 'City/State/Zip', value: `${entity.city}, ${entity.state} ${entity.zip}` },
        { label: 'Entity Type', value: entity.entityType },
        { label: 'Rep Assigned', value: entity.assigned?.rep || 'Unassigned' },
        { label: 'Last Visit', value: entity.status?.lastVisit || 'None' },
        { label: 'Next Visit', value: entity.status?.nextVisit || 'Not scheduled' }
      );
    } else if (entity.type === 'contact') {
      details.push(
        { label: 'Email', value: entity.email || 'N/A' },
        { label: 'Phone', value: entity.phone || 'N/A' },
        { label: 'Address', value: entity.address || 'N/A' },
        { label: 'Relationship', value: 'Not specified' },
        { label: 'Last Contact', value: entity.status?.lastContact || 'None' },
        { label: 'Next Contact', value: entity.status?.nextContact || 'Not scheduled' }
      );
    } else if (entity.type === 'opportunity') {
      details.push(
        { label: 'Value', value: `$${entity.value.toLocaleString()}` },
        { label: 'Status', value: entity.status },
        { label: 'Probability', value: `${entity.probability}%` },
        { label: 'Contact', value: entity.contact?.name || 'None' },
        { label: 'Address', value: entity.address?.name || 'None' },
        { label: 'Rep Assigned', value: entity.assigned?.rep || 'Unassigned' }
      );
    }
    
    return this.createElement('div', { class: 'pulse-content details-content' },
      details.map(detail => 
        this.createElement('div', { class: 'detail-item' }, [
          this.createElement('div', { class: 'detail-label' }, detail.label),
          this.createElement('div', { class: 'detail-value' }, detail.value)
        ])
      )
    );
  }

  /**
   * Render loading skeleton
   * @returns {HTMLElement} Skeleton DOM element
   */
  renderSkeleton() {
    return this.createElement('div', { 
      class: 'entity-card',
      'data-entity-type': this.getState().entityType,
      'data-card-layout': this.getState().cardLayout
    }, [
      this.createElement('div', { class: 'card-header' }, 'Loading...'),
      this.createElement('div', { class: 'card-content' }, [
        this.createElement('div', { class: 'skeleton skeleton-title' }),
        this.createElement('div', { class: 'skeleton skeleton-text' }),
        this.createElement('div', { class: 'skeleton skeleton-text-short' }),
        this.createElement('div', { class: 'card-actions' }, [
          this.createElement('button', { class: 'card-button card-view-button' }, 'View'),
          this.createElement('button', { class: 'card-button card-primary-button' }, 'Action')
        ])
      ])
    ]);
  }

  /**
   * Render entity metadata based on type
   * @returns {HTMLElement} Entity metadata element
   */
  renderEntityMeta() {
    const { entity } = this.getState();
    if (!entity) return null;
    
    const metaItems = [];
    
    // Add metadata based on entity type
    if (entity.type === 'address') {
      metaItems.push(
        this.createElement('div', { class: 'meta-item' }, entity.street),
        this.createElement('div', { class: 'meta-item' }, `${entity.city}, ${entity.state} ${entity.zip}`)
      );
    } else if (entity.type === 'contact') {
      metaItems.push(
        this.createElement('div', { class: 'meta-item' }, entity.email || 'No email'),
        this.createElement('div', { class: 'meta-item' }, entity.phone || 'No phone'),
        this.createElement('div', { class: 'meta-item' }, entity.address || '')
      );
    } else if (entity.type === 'opportunity') {
      metaItems.push(
        this.createElement('div', { class: 'meta-item' }, `Value: $${entity.value.toLocaleString()}`),
        this.createElement('div', { class: 'meta-item' }, `Status: ${entity.status}`),
        this.createElement('div', { class: 'meta-item' }, entity.contact ? `Contact: ${entity.contact.name}` : '')
      );
    }
    
    return this.createElement('div', { class: 'entity-meta' }, metaItems);
  }

  /**
   * Render entity card actions based on type
   * @returns {HTMLElement} Card actions element
   */
  renderCardActions() {
    const { entity } = this.getState();
    if (!entity) return null;
    
    let primaryAction = '';
    
    // Set primary action based on entity type
    if (entity.type === 'address') {
      primaryAction = 'KNOCK';
    } else if (entity.type === 'contact') {
      primaryAction = 'CONTACT';
    } else if (entity.type === 'opportunity') {
      primaryAction = 'UPDATE';
    }
    
    return this.createElement('div', { class: 'card-actions' }, [
      this.createElement('button', { 
        class: 'card-button card-view-button',
        'data-action': 'view' 
      }, 'View'),
      this.createElement('button', { 
        class: 'card-button card-primary-button',
        'data-action': 'primary' 
      }, primaryAction)
    ]);
  }

  /**
   * Render component template
   */
  render() {
    const { entity, entityType, cardLayout, pulseComponents, activePulseComponent, loading, error } = this.getState();
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    if (loading) {
      this.shadowRoot.appendChild(this.renderSkeleton());
      return;
    }
    
    if (error) {
      this.shadowRoot.appendChild(
        this.createElement('div', { class: 'error-message' }, 
          `Error loading entity: ${error}`
        )
      );
      return;
    }
    
    if (!entity) {
      this.shadowRoot.appendChild(
        this.createElement('div', { class: 'error-message' }, 
          'No entity data available'
        )
      );
      return;
    }
    
    // Create pulse tabs
    const pulseTabs = this.createElement('div', { class: 'pulse-tabs' },
      pulseComponents.map(component => 
        this.createElement('div', { 
          class: `pulse-tab ${component.id === activePulseComponent?.id ? 'active' : ''}`,
          'data-pulse-type': component.type
        }, [
          component.icon ? this.createElement('span', { class: 'pulse-icon' }, component.icon) : null,
          component.label
        ])
      )
    );
    
    // Create entity card
    const card = this.createElement('div', { 
      class: 'entity-card',
      'data-entity-type': entityType,
      'data-card-layout': cardLayout
    }, [
      this.createElement('div', { class: 'card-header' }, [
        entity.name,
        this.createElement('div', { class: 'entity-type-badge' }, entityType)
      ]),
      this.createElement('div', { class: 'card-content' }, [
        this.createElement('div', { class: 'entity-name' }, entity.name),
        this.renderEntityMeta(),
        this.renderCardActions()
      ]),
      this.createElement('div', { class: 'pulse-container' }, [
        pulseTabs,
        this.renderPulseContent()
      ])
    ]);
    
    this.shadowRoot.appendChild(card);
  }
}

// Register the component
if (!customElements.get('entity-card')) {
  customElements.define('entity-card', EntityCardView);
}

export default EntityCardView;