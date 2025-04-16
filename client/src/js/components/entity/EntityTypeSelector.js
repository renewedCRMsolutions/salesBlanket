// /src/js/components/entity/EntityTypeSelector.js

/**
 * EntityTypeSelector.js
 *
 * Component for selecting entity types.
 * Displays entity types in a grid or list.
 */

import { BaseView } from '../base/BaseView.js';

export class EntityTypeSelector extends BaseView {
  constructor() {
    super();

    // Bind methods
    this.handleSelection = this.handleSelection.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      entityTypes: this.getAttribute('entity-types')
        ? JSON.parse(this.getAttribute('entity-types'))
        : [],
      selectedTypeId: null,
    };
  }

  /**
   * When attributes change
   * @param {string} name - Attribute name
   * @param {string} oldValue - Old value
   * @param {string} newValue - New value
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'entity-types' && oldValue !== newValue) {
      try {
        const entityTypes = JSON.parse(newValue);
        this.setState({ entityTypes });
      } catch (error) {
        console.error('Invalid entity types data:', error);
      }
    }
  }

  /**
   * Define observed attributes
   * @returns {Array} List of attributes to observe
   */
  static get observedAttributes() {
    return ['entity-types'];
  }

  /**
   * Handle entity type selection
   * @param {Event} event - Click event
   */
  handleSelection(event) {
    const typeItem = event.target.closest('[data-type-id]');
    if (!typeItem) return;

    const typeId = typeItem.dataset.typeId;

    this.setState({ selectedTypeId: typeId });

    this.dispatchEvent(
      new CustomEvent('type-selected', {
        bubbles: true,
        composed: true,
        detail: { typeId },
      })
    );
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    const typesList = this.shadowRoot.querySelector('.entity-types');
    if (typesList) {
      this.addTrackedEventListener('click', this.handleSelection, {}, typesList);
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
      }
      
      .entity-types {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 1rem;
      }
      
      .entity-type {
        background-color: #f5f5f5;
        border-radius: 4px;
        padding: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
        text-align: center;
      }
      
      .entity-type:hover {
        background-color: #e9e9e9;
      }
      
      .entity-type.selected {
        background-color: #1A3A59; /* Golf Blau */
        color: white;
      }
      
      .entity-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }
      
      .entity-name {
        font-weight: 500;
      }
      
      .entity-description {
        font-size: 0.9rem;
        color: #666;
        margin-top: 0.25rem;
      }
      
      .entity-type.selected .entity-description {
        color: rgba(255, 255, 255, 0.8);
      }
      
      .empty-state {
        text-align: center;
        padding: 2rem;
        color: #666;
      }
    `;
  }

  /**
   * Render component
   */
  render() {
    const { entityTypes, selectedTypeId } = this.getState();

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());

    const container = this.createElement('div', { class: 'entity-type-selector' }, [
      entityTypes.length === 0
        ? this.createElement('div', { class: 'empty-state' }, 'No entity types available')
        : this.createElement(
            'div',
            { class: 'entity-types' },
            entityTypes.map((type) =>
              this.createElement(
                'div',
                {
                  class: `entity-type ${selectedTypeId === type.id ? 'selected' : ''}`,
                  'data-type-id': type.id,
                },
                [
                  this.createElement('div', { class: 'entity-icon' }, type.displayName.charAt(0)),
                  this.createElement('div', { class: 'entity-name' }, type.displayName),
                  type.description
                    ? this.createElement('div', { class: 'entity-description' }, type.description)
                    : null,
                ]
              )
            )
          ),
    ]);

    this.shadowRoot.appendChild(container);
  }
}

// Register component
customElements.define('entity-type-selector', EntityTypeSelector);

export default EntityTypeSelector;
