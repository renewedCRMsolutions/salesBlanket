/**
 * EntityForm.js
 * 
 * Component for rendering and handling entity forms.
 * Generates form fields based on form schema.
 */

import { BaseView } from '../BaseView.js';

export class EntityForm extends BaseView {
  constructor() {
    super();
    
    // Bind methods
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      form: this.getAttribute('form') ? JSON.parse(this.getAttribute('form')) : null,
      loading: false,
      error: null
    };
  }

  /**
   * When attributes change
   * @param {string} name - Attribute name
   * @param {string} oldValue - Old value
   * @param {string} newValue - New value
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'form' && oldValue !== newValue) {
      try {
        const form = JSON.parse(newValue);
        this.setState({ form });
      } catch (error) {
        console.error('Invalid form data:', error);
      }
    }
  }

  /**
   * Define observed attributes
   * @returns {Array} List of attributes to observe
   */
  static get observedAttributes() {
    return ['form'];
  }

  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    this.dispatchEvent(new CustomEvent('form-submit', {
      bubbles: true,
      composed: true,
      detail: { data }
    }));
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    const form = this.shadowRoot.querySelector('form');
    if (form) {
      this.addTrackedEventListener('submit', this.handleSubmit, {}, form);
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
      
      .form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .form-label {
        font-weight: 500;
      }
      
      .required {
        color: #960018; /* Carmine Red */
      }
      
      .form-input {
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
      }
      
      .form-input:focus {
        outline: none;
        border-color: #1A3A59; /* Golf Blau */
        box-shadow: 0 0 0 2px rgba(26, 58, 89, 0.2);
      }
      
      .form-textarea {
        min-height: 100px;
        resize: vertical;
      }
      
      .form-select {
        height: auto;
        padding: 0.75rem;
      }
      
      .form-error {
        color: #960018; /* Carmine Red */
        font-size: 0.9rem;
        margin-top: 0.25rem;
      }
      
      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1rem;
      }
      
      .form-button {
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .button-primary {
        background-color: #1A3A59; /* Golf Blau */
        color: white;
        border: none;
      }
      
      .button-primary:hover {
        background-color: #2D4A71; /* Shark Blue */
      }
      
      .button-secondary {
        background-color: transparent;
        color: #1A3A59; /* Golf Blau */
        border: 1px solid #1A3A59; /* Golf Blau */
      }
      
      .button-secondary:hover {
        background-color: rgba(26, 58, 89, 0.1);
      }
      
      .error-message {
        color: #960018; /* Carmine Red */
        margin-bottom: 1rem;
        font-size: 0.9rem;
        font-weight: 500;
      }
    `;
  }

  /**
   * Render component
   */
  render() {
    const { form, error } = this.getState();
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    if (!form) {
      return;
    }
    
    const container = this.createElement('div', { class: 'entity-form-container' }, [
      // Error message
      error ? this.createElement('div', { class: 'error-message' }, error) : null,
      
      // Form
      this.createElement('form', { class: 'form' }, [
        // Form fields
        ...(form.fields || []).map(field => {
          return this.createElement('div', { class: 'form-group' }, [
            this.createElement('label', { 
              class: 'form-label',
              for: field.fieldName
            }, [
              field.displayName,
              field.isRequired ? 
                this.createElement('span', { class: 'required' }, ' *') : null
            ]),
            
            field.fieldType === 'textarea' ?
              this.createElement('textarea', { 
                class: 'form-input form-textarea',
                id: field.fieldName,
                name: field.fieldName,
                required: field.isRequired
              }) :
            
            field.fieldType === 'select' ?
              this.createElement('select', { 
                class: 'form-input form-select',
                id: field.fieldName,
                name: field.fieldName,
                required: field.isRequired
              }, [
                this.createElement('option', { value: '' }, 'Select...'),
                ...(field.options?.options || []).map(option => 
                  this.createElement('option', { value: option }, option)
                )
              ]) :
            
            field.fieldType === 'checkbox' ?
              this.createElement('input', { 
                class: 'form-checkbox',
                type: 'checkbox',
                id: field.fieldName,
                name: field.fieldName,
                value: 'true'
              }) :
            
            // Default to text input
            this.createElement('input', { 
              class: 'form-input',
              type: field.fieldType || 'text',
              id: field.fieldName,
              name: field.fieldName,
              required: field.isRequired,
              placeholder: field.placeholder || ''
            })
          ]);
        }),
        
        // Form actions
        this.createElement('div', { class: 'form-actions' }, [
          this.createElement('button', { 
            class: 'form-button button-primary',
            type: 'submit'
          }, 'Submit')
        ])
      ])
    ]);
    
    this.shadowRoot.appendChild(container);
  }
}

// Register component
customElements.define('entity-form', EntityForm);

export default EntityForm;