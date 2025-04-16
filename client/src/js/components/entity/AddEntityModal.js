/**
 * AddEntityModal.js
 * 
 * Modal component for adding new entities.
 * Guides user through the entity creation process.
 */

import { BaseView } from '../BaseView.js';
import ViewState from '../../services/ViewState.js';
import GraphQLClient from '../../services/GraphQLClient.js';
import EntityService from '../../services/EntityService.js';
import EntityTypeSelector from './EntityTypeSelector.js';
import EntityForm from './EntityForm.js';

export class AddEntityModal extends BaseView {
  constructor() {
    super();
    this.viewState = ViewState;
    this.entityService = new EntityService(new GraphQLClient());
    
    // Bind methods
    this.handleClose = this.handleClose.bind(this);
    this.handleStepChange = this.handleStepChange.bind(this);
    this.handleParentEntitySelect = this.handleParentEntitySelect.bind(this);
    this.handleEntityTypeSelect = this.handleEntityTypeSelect.bind(this);
    this.handleSubtypeSelect = this.handleSubtypeSelect.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  /**
   * Initialize component
   */
  initialize() {
    this._state = {
      isOpen: false,
      loading: false,
      error: null,
      currentStep: 1,
      parentEntities: [],
      entityTypes: [],
      entitySubtypes: [],
      selectedForm: null,
      selection: {
        parentEntityId: null,
        entityTypeId: null,
        subtypeIds: []
      },
      completedForms: [],
      currentSubtypeIndex: 0
    };
    
    // Load parent entities when component initializes
    this.loadParentEntities();
  }

  /**
   * Load parent entities from API
   */
  async loadParentEntities() {
    try {
      this.setState({ loading: true, error: null });
      
      // In development, use mock data if needed
      let parentEntities;
      if (process.env.NODE_ENV === 'development' && !window.useRealApi) {
        parentEntities = await this.entityService.getMockCreatableParentEntities();
      } else {
        parentEntities = await this.entityService.getCreatableParentEntities();
      }
      
      this.setState({ 
        parentEntities,
        loading: false 
      });
    } catch (error) {
      console.error('Failed to load parent entities:', error);
      this.setState({ 
        error: 'Failed to load entity types. Please try again.',
        loading: false
      });
    }
  }

  /**
   * Load entity types for selected parent
   * @param {string} parentId - Parent entity ID
   */
  async loadEntityTypes(parentId) {
    try {
      this.setState({ loading: true, error: null });
      
      // In development, use mock data if needed
      let entityTypes;
      if (process.env.NODE_ENV === 'development' && !window.useRealApi) {
        entityTypes = await this.entityService.getMockEntityTypesByParent(parentId);
      } else {
        entityTypes = await this.entityService.getEntityTypesByParent(parentId);
      }
      
      this.setState({ 
        entityTypes,
        loading: false 
      });
    } catch (error) {
      console.error('Failed to load entity types:', error);
      this.setState({ 
        error: 'Failed to load entity types. Please try again.',
        loading: false
      });
    }
  }

  /**
   * Load entity subtypes for selected type
   * @param {string} typeId - Entity type ID
   */
  async loadEntitySubtypes(typeId) {
    try {
      this.setState({ loading: true, error: null });
      
      // In development, use mock data if needed
      let entitySubtypes;
      if (process.env.NODE_ENV === 'development' && !window.useRealApi) {
        entitySubtypes = await this.entityService.getMockEntitySubtypesByType(typeId);
      } else {
        entitySubtypes = await this.entityService.getEntitySubtypesByType(typeId);
      }
      
      this.setState({ 
        entitySubtypes,
        loading: false 
      });
    } catch (error) {
      console.error('Failed to load entity subtypes:', error);
      this.setState({ 
        error: 'Failed to load entity subtypes. Please try again.',
        loading: false
      });
    }
  }

  /**
   * Load form for selected subtype
   * @param {string} subtypeId - Entity subtype ID
   */
  async loadForm(subtypeId) {
    try {
      this.setState({ loading: true, error: null });
      
      // In development, use mock data if needed
      let form;
      if (process.env.NODE_ENV === 'development' && !window.useRealApi) {
        form = await this.entityService.getMockFormBySubtype(subtypeId);
      } else {
        form = await this.entityService.getFormBySubtype(subtypeId);
      }
      
      this.setState({ 
        selectedForm: form,
        loading: false 
      });
    } catch (error) {
      console.error('Failed to load form:', error);
      this.setState({ 
        error: 'Failed to load form. Please try again.',
        loading: false
      });
    }
  }

  /**
   * Open the modal
   */
  open() {
    this.setState({ isOpen: true });
  }

  /**
   * Close the modal
   */
  close() {
    this.setState({ 
      isOpen: false, 
      currentStep: 1,
      error: null,
      selection: {
        parentEntityId: null,
        entityTypeId: null,
        subtypeIds: []
      },
      completedForms: [],
      currentSubtypeIndex: 0,
      selectedForm: null
    });
  }

  /**
   * Handle modal close
   */
  handleClose() {
    this.close();
  }

  /**
   * Handle step change
   * @param {number} step - Step number
   */
  handleStepChange(step) {
    this.setState({ currentStep: step });
  }

  /**
   * Handle parent entity selection
   * @param {Event} event - Click event
   */
  handleParentEntitySelect(event) {
    const parentId = event.target.closest('[data-parent-id]')?.dataset.parentId;
    if (!parentId) return;
    
    this.setState({
      selection: {
        ...this.getState().selection,
        parentEntityId: parentId
      }
    });
    
    this.loadEntityTypes(parentId);
    this.handleStepChange(2);
  }

  /**
   * Handle entity type selection
   * @param {Event} event - Click event
   */
  handleEntityTypeSelect(event) {
    const typeId = event.target.closest('[data-type-id]')?.dataset.typeId;
    if (!typeId) return;
    
    this.setState({
      selection: {
        ...this.getState().selection,
        entityTypeId: typeId
      }
    });
    
    this.loadEntitySubtypes(typeId);
    this.handleStepChange(3);
  }

  /**
   * Handle subtype selection
   * @param {Event} event - Submit event
   */
  handleSubtypeSelect(event) {
    event.preventDefault();
    
    const form = event.target;
    const subtypeElements = form.querySelectorAll('input[name="subtype"]:checked');
    const subtypeIds = Array.from(subtypeElements).map(el => el.value);
    
    if (subtypeIds.length === 0) {
      this.setState({ error: 'Please select at least one subtype' });
      return;
    }
    
    this.setState({
      selection: {
        ...this.getState().selection,
        subtypeIds
      },
      currentSubtypeIndex: 0,
      error: null
    });
    
    // Load the first form
    this.loadForm(subtypeIds[0]);
    this.handleStepChange(4);
  }

  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {};
    
    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    const { selection, currentSubtypeIndex, completedForms } = this.getState();
    const currentSubtypeId = selection.subtypeIds[currentSubtypeIndex];
    
    // Store the completed form
    const updatedCompletedForms = [
      ...completedForms,
      {
        subtypeId: currentSubtypeId,
        data
      }
    ];
    
    // Check if there are more subtypes
    const nextIndex = currentSubtypeIndex + 1;
    if (nextIndex < selection.subtypeIds.length) {
      // Load the next form
      this.setState({
        completedForms: updatedCompletedForms,
        currentSubtypeIndex: nextIndex
      });
      
      this.loadForm(selection.subtypeIds[nextIndex]);
      return;
    }
    
    // All forms completed, submit the entity data
    try {
      this.setState({ loading: true, error: null });
      
      // TODO: Implement the actual submission logic
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Close the modal on success
      this.setState({ 
        loading: false,
        completedForms: []
      });
      
      this.close();
      
      // Show success message
      this.dispatchEvent(new CustomEvent('entity-created', {
        bubbles: true,
        composed: true,
        detail: {
          type: this.getEntityTypeName(selection.entityTypeId),
        }
      }));
    } catch (error) {
      console.error('Failed to create entity:', error);
      this.setState({ 
        error: 'Failed to create entity. Please try again.',
        loading: false
      });
    }
  }

  /**
   * Get entity type name by ID
   * @param {string} typeId - Entity type ID
   * @returns {string} Entity type name
   */
  getEntityTypeName(typeId) {
    const { entityTypes } = this.getState();
    return entityTypes.find(type => type.id === typeId)?.displayName || 'Entity';
  }

  /**
   * Add component event listeners
   */
  addEventListeners() {
    // Close button
    const closeButton = this.shadowRoot.querySelector('.close-button');
    if (closeButton) {
      this.addTrackedEventListener('click', this.handleClose, {}, closeButton);
    }
    
    // Parent entity selection
    const parentSelector = this.shadowRoot.querySelector('.parent-selector');
    if (parentSelector) {
      this.addTrackedEventListener('click', this.handleParentEntitySelect, {}, parentSelector);
    }
    
    // Entity type selection
    const typeSelector = this.shadowRoot.querySelector('.type-selector');
    if (typeSelector) {
      this.addTrackedEventListener('click', this.handleEntityTypeSelect, {}, typeSelector);
    }
    
    // Subtype selection form
    const subtypeForm = this.shadowRoot.querySelector('.subtype-form');
    if (subtypeForm) {
      this.addTrackedEventListener('submit', this.handleSubtypeSelect, {}, subtypeForm);
    }
    
    // Entity form
    const entityForm = this.shadowRoot.querySelector('.entity-form');
    if (entityForm) {
      this.addTrackedEventListener('submit', this.handleFormSubmit, {}, entityForm);
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
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.5);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease-in-out;
      }
      
      :host([open]) {
        opacity: 1;
        pointer-events: auto;
      }
      
      .modal {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .modal-header {
        padding: 1rem;
        background-color: #2F4F2F; /* Brewster Green */
        color: white;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .close-button {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      }
      
      .modal-content {
        padding: 1.5rem;
        max-height: calc(90vh - 120px);
        overflow-y: auto;
      }
      
      .steps {
        display: flex;
        margin-bottom: 1.5rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 1rem;
      }
      
      .step {
        flex: 1;
        text-align: center;
        position: relative;
        padding-bottom: 0.5rem;
      }
      
      .step-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: #eee;
        margin-bottom: 0.5rem;
        font-weight: bold;
      }
      
      .step.active .step-number {
        background-color: #1A3A59; /* Golf Blau */
        color: white;
      }
      
      .step.completed .step-number {
        background-color: #9CCB19; /* Lime Green */
        color: white;
      }
      
      .step-label {
        font-size: 0.9rem;
        color: #666;
      }
      
      .step.active .step-label {
        color: #1A3A59; /* Golf Blau */
        font-weight: bold;
      }
      
      .step-content {
        margin-bottom: 1.5rem;
      }
      
      .step-title {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 1rem;
        color: #2F4F2F; /* Brewster Green */
      }
      
      .entity-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 1rem;
      }
      
      .entity-item {
        background-color: #f5f5f5;
        border-radius: 4px;
        padding: 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
        text-align: center;
      }
      
      .entity-item:hover {
        background-color: #e9e9e9;
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
      
      .subtype-list {
        margin-bottom: 1.5rem;
      }
      
      .subtype-item {
        display: flex;
        align-items: center;
        margin-bottom: 0.75rem;
      }
      
      .subtype-checkbox {
        margin-right: 0.75rem;
      }
      
      .subtype-info {
        flex: 1;
      }
      
      .subtype-name {
        font-weight: 500;
      }
      
      .subtype-description {
        font-size: 0.9rem;
        color: #666;
      }
      
      .form-group {
        margin-bottom: 1.5rem;
      }
      
      .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
      
      .form-input {
        width: 100%;
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
      
      .error-message {
        color: #960018; /* Carmine Red */
        margin-bottom: 1rem;
        font-size: 0.9rem;
        font-weight: 500;
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
      
      .modal-footer {
        padding: 1rem;
        border-top: 1px solid #eee;
        text-align: right;
      }
      
      .button {
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
      
      .button-primary:disabled {
        background-color: #9EA3B0; /* Platinum */
        cursor: not-allowed;
      }
      
      .button-secondary {
        background-color: transparent;
        color: #1A3A59; /* Golf Blau */
        border: 1px solid #1A3A59; /* Golf Blau */
        margin-right: 0.75rem;
      }
      
      .button-secondary:hover {
        background-color: rgba(26, 58, 89, 0.1);
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
      isOpen, 
      loading, 
      error, 
      currentStep,
      parentEntities,
      entityTypes,
      entitySubtypes,
      selectedForm,
      selection,
      currentSubtypeIndex
    } = this.getState();
    
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.createStyles());
    
    if (isOpen) {
      this.setAttribute('open', '');
    } else {
      this.removeAttribute('open');
      return;
    }
    
    const container = this.createElement('div', { class: 'modal' }, [
      // Modal header
      this.createElement('div', { class: 'modal-header' }, [
        'Add New Record',
        this.createElement('button', { class: 'close-button' }, '×')
      ]),
      
      // Modal content
      this.createElement('div', { class: 'modal-content' }, [
        // Steps
        this.createElement('div', { class: 'steps' }, [
          this.createElement('div', { 
            class: `step ${currentStep === 1 ? 'active' : ''}${currentStep > 1 ? 'completed' : ''}` 
          }, [
            this.createElement('div', { class: 'step-number' }, '1'),
            this.createElement('div', { class: 'step-label' }, 'Entity Type')
          ]),
          this.createElement('div', { 
            class: `step ${currentStep === 2 ? 'active' : ''}${currentStep > 2 ? 'completed' : ''}` 
          }, [
            this.createElement('div', { class: 'step-number' }, '2'),
            this.createElement('div', { class: 'step-label' }, 'Category')
          ]),
          this.createElement('div', { 
            class: `step ${currentStep === 3 ? 'active' : ''}${currentStep > 3 ? 'completed' : ''}` 
          }, [
            this.createElement('div', { class: 'step-number' }, '3'),
            this.createElement('div', { class: 'step-label' }, 'Subtypes')
          ]),
          this.createElement('div', { 
            class: `step ${currentStep === 4 ? 'active' : ''}${currentStep > 4 ? 'completed' : ''}` 
          }, [
            this.createElement('div', { class: 'step-number' }, '4'),
            this.createElement('div', { class: 'step-label' }, 'Details')
          ])
        ]),
        
        // Error message
        error ? this.createElement('div', { class: 'error-message' }, error) : null,
        
        // Step 1: Select parent entity
        currentStep === 1 ? this.createElement('div', { class: 'step-content' }, [
          this.createElement('div', { class: 'step-title' }, 'Select Entity Type'),
          
          loading ? this.createElement('div', { class: 'loading-spinner' }) : null,
          
          this.createElement('div', { class: 'entity-list parent-selector' }, 
            parentEntities.map(entity => 
              this.createElement('div', { 
                class: 'entity-item',
                'data-parent-id': entity.id
              }, [
                this.createElement('div', { class: 'entity-icon' }, 
                  entity.displayName.charAt(0)
                ),
                this.createElement('div', { class: 'entity-name' }, 
                  entity.displayName
                ),
                this.createElement('div', { class: 'entity-description' }, 
                  entity.parentCategory
                )
              ])
            )
          )
        ]) : null,
        
        // Step 2: Select entity type
        currentStep === 2 ? this.createElement('div', { class: 'step-content' }, [
          this.createElement('div', { class: 'step-title' }, 'Select Category'),
          
          loading ? this.createElement('div', { class: 'loading-spinner' }) : null,
          
          this.createElement('div', { class: 'entity-list type-selector' }, 
            entityTypes.map(type => 
              this.createElement('div', { 
                class: 'entity-item',
                'data-type-id': type.id
              }, [
                this.createElement('div', { class: 'entity-name' }, 
                  type.displayName
                )
              ])
            )
          )
        ]) : null,
        
        // Step 3: Select subtypes
        currentStep === 3 ? this.createElement('div', { class: 'step-content' }, [
          this.createElement('div', { class: 'step-title' }, 'Select Subtypes'),
          
          loading ? this.createElement('div', { class: 'loading-spinner' }) : null,
          
          this.createElement('form', { class: 'subtype-form' }, [
            this.createElement('div', { class: 'subtype-list' }, 
              entitySubtypes.map(subtype => 
                this.createElement('div', { class: 'subtype-item' }, [
                  this.createElement('input', { 
                    class: 'subtype-checkbox',
                    type: 'checkbox',
                    id: `subtype-${subtype.id}`,
                    name: 'subtype',
                    value: subtype.id
                  }),
                  this.createElement('div', { class: 'subtype-info' }, [
                    this.createElement('label', { 
                      class: 'subtype-name',
                      for: `subtype-${subtype.id}`
                    }, subtype.name),
                    this.createElement('div', { class: 'subtype-description' }, 
                      subtype.description
                    )
                  ])
                ])
              )
            ),
            
            this.createElement('div', { class: 'modal-footer' }, [
              this.createElement('button', { 
                class: 'button button-primary',
                type: 'submit'
              }, 'Continue')
            ])
          ])
        ]) : null,
        
        // Step 4: Fill form
        currentStep === 4 && selectedForm ? this.createElement('div', { class: 'step-content' }, [
          this.createElement('div', { class: 'step-title' }, [
            selectedForm.title,
            selection.subtypeIds.length > 1 ? 
              ` (${currentSubtypeIndex + 1}/${selection.subtypeIds.length})` : ''
          ]),
          
          loading ? this.createElement('div', { class: 'loading-spinner' }) : null,
          
          this.createElement('form', { class: 'entity-form' }, [
            ...selectedForm.fields.map(field => 
              this.createElement('div', { class: 'form-group' }, [
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
                    class: 'form-input',
                    id: field.fieldName,
                    name: field.fieldName,
                    required: field.isRequired
                  }) :
                
                field.fieldType === 'select' ?
                  this.createElement('select', { 
                    class: 'form-input',
                    id: field.fieldName,
                    name: field.fieldName,
                    required: field.isRequired
                  }, [
                    this.createElement('option', { value: '' }, 'Select...'),
                    ...(field.options?.options || []).map(option => 
                      this.createElement('option', { value: option }, option)
                    )
                  ]) :
                
                // Default to text input
                this.createElement('input', { 
                  class: 'form-input',
                  type: field.fieldType || 'text',
                  id: field.fieldName,
                  name: field.fieldName,
                  required: field.isRequired
                })
              ])
            ),
            
            this.createElement('div', { class: 'modal-footer' }, [
              this.createElement('button', { 
                class: 'button button-primary',
                type: 'submit',
                disabled: loading
              }, 
                currentSubtypeIndex < selection.subtypeIds.length - 1 ?
                  'Continue to Next Form' : 'Submit'
              )
            ])
          ])
        ]) : null
      ])
    ]);
    
    this.shadowRoot.appendChild(container);
  }
}

// Register component
customElements.define('add-entity-modal', AddEntityModal);

export default AddEntityModal;