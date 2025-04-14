Based on my research, I can see that JSON Schema-based form systems are the current standard for dynamic form generation as they allow you to define and adjust forms through a single configuration file without writing HTML Peterullrich. The most modern implementations include headless UI form libraries that transform JSON schemas into JavaScript to be consumed by your UI libraries GitHub, giving us exactly the flexibility you're looking for.
Now, let me finalize the complete table structure and A-Z workflow for your system.
Complete Table Structure
Core Entity Tables (You Already Have)

addresses
contacts
opportunities
collections
streets, neighborhoods
users

Form System Tables (To Add)

form_definitions

sqlCREATE TABLE public.form_definitions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(100) NOT NULL,
    description text,
    organization_id uuid REFERENCES public.organizations(id),
    department_id uuid REFERENCES public.departments(id),
    entity_type_id uuid REFERENCES public.entity_types(id),
    entity_subtype_id uuid, -- For contact_types, opportunity_types
    category_id uuid REFERENCES public.form_categories(id), -- Insurance/Retail
    form_level varchar(50) NOT NULL CHECK (form_level IN ('BASE', 'TYPE', 'CATEGORY', 'SPECIALIZED')),
    form_schema jsonb NOT NULL,
    version integer NOT NULL DEFAULT 1,
    is_active boolean DEFAULT true,
    is_public boolean DEFAULT false, -- For sharing between orgs
    created_by uuid REFERENCES public.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

form_versions

sqlCREATE TABLE public.form_versions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_definition_id uuid REFERENCES public.form_definitions(id),
    version integer NOT NULL,
    form_schema jsonb NOT NULL,
    created_by uuid REFERENCES public.users(id),
    created_at timestamptz DEFAULT now()
);

form_categories

sqlCREATE TABLE public.form_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(100) NOT NULL, -- e.g., 'Insurance', 'Retail'
    description text,
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES public.users(id),
    created_at timestamptz DEFAULT now()
);

work_types

sqlCREATE TABLE public.work_types (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(100) NOT NULL, -- e.g., 'Roofing', 'Siding', 'Gutters'
    description text,
    is_active boolean DEFAULT true,
    created_by uuid REFERENCES public.users(id),
    created_at timestamptz DEFAULT now()
);

opportunity_type_work_types

sqlCREATE TABLE public.opportunity_type_work_types (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_type_id uuid REFERENCES public.opportunity_types(id),
    work_type_id uuid REFERENCES public.work_types(id),
    created_at timestamptz DEFAULT now()
);

form_components

sqlCREATE TABLE public.form_components (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(100) NOT NULL,
    description text,
    component_type varchar(50) NOT NULL, -- 'text', 'select', 'photo_collection', etc.
    default_config jsonb NOT NULL,
    is_active boolean DEFAULT true,
    is_public boolean DEFAULT false, -- For sharing between orgs
    organization_id uuid REFERENCES public.organizations(id),
    created_by uuid REFERENCES public.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

form_component_usage

sqlCREATE TABLE public.form_component_usage (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_definition_id uuid REFERENCES public.form_definitions(id),
    component_id uuid REFERENCES public.form_components(id),
    display_order integer NOT NULL,
    custom_config jsonb, -- Overrides for default config
    created_at timestamptz DEFAULT now()
);

document_templates

sqlCREATE TABLE public.document_templates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(100) NOT NULL,
    description text,
    document_type varchar(50) NOT NULL, -- 'estimate', 'inspection', 'report'
    organization_id uuid REFERENCES public.organizations(id),
    department_id uuid REFERENCES public.departments(id),
    layout jsonb NOT NULL, -- Component layout
    is_active boolean DEFAULT true,
    is_public boolean DEFAULT false, -- For sharing between orgs
    created_by uuid REFERENCES public.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

documents

sqlCREATE TABLE public.documents (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(100) NOT NULL,
    document_type varchar(50) NOT NULL, -- 'estimate', 'inspection', 'report'
    document_template_id uuid REFERENCES public.document_templates(id),
    collection_id uuid REFERENCES public.collections(id),
    opportunity_id uuid REFERENCES public.opportunities(id),
    version integer NOT NULL DEFAULT 1,
    status varchar(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, PRESENTED, APPROVED, REJECTED
    layout jsonb NOT NULL, -- Component layout
    content jsonb NOT NULL, -- Data/content 
    created_by uuid REFERENCES public.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

document_components

sqlCREATE TABLE public.document_components (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id uuid REFERENCES public.documents(id),
    component_type varchar(50) NOT NULL, -- 'line_items', 'photo_gallery', etc.
    display_order integer NOT NULL,
    config jsonb NOT NULL, -- Component configuration
    content jsonb, -- Component data 
    source_reference jsonb, -- References to source data
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

collection_contact_roles

sqlCREATE TABLE public.collection_contact_roles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id uuid REFERENCES public.collections(id),
    contact_id uuid REFERENCES public.contacts(id),
    role_type varchar(50) NOT NULL, -- 'PRIMARY', 'SPOUSE', 'AGENT', etc.
    created_at timestamptz DEFAULT now()
);

data_source_references

sqlCREATE TABLE public.data_source_references (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_id uuid NOT NULL, -- Document/component using this data
    target_type varchar(50) NOT NULL, -- 'document', 'document_component'
    source_id uuid NOT NULL, -- Entity providing data
    source_type varchar(50) NOT NULL, -- 'opportunity', 'contact', etc.
    source_form_id uuid REFERENCES public.form_definitions(id),
    data_path text, -- JSON path to specific data
    created_at timestamptz DEFAULT now()
);
A-Z Workflow Implementation
1. Address Entry Workflow (Static Form)
1. User navigates to "Add New Address"
2. System presents static Form A for addresses
3. User completes and submits the form
4. System creates:
   - Address record
   - Streets record (if new)
   - Collection record
5. User is presented with Form Part B options
Implementation:
javascript// Address form submission handler
async function submitAddressForm(formData) {
  try {
    // 1. Create address record
    const addressResponse = await fetch('/api/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        street: formData.street,
        address_line_2: formData.address_line_2,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        // Other address fields
      })
    });
    
    const addressData = await addressResponse.json();
    
    // 2. Streets record is created automatically via trigger/procedure
    
    // 3. Create or update collection
    const collectionResponse = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address_id: addressData.id,
        // Other collection fields
      })
    });
    
    const collectionData = await collectionResponse.json();
    
    // 4. Redirect to Selection form (Part B)
    window.location.href = `/collections/${collectionData.id}/selection`;
    
  } catch (error) {
    console.error('Error submitting address form:', error);
    showErrorMessage('Failed to save address. Please try again.');
  }
}
2. Contact Entry Workflow (Dynamic Form)
1. User selects "Add New Contact" from collection view
2. System presents static Form A for contacts (name, email, etc.)
3. User selects contact_type_id from dropdown
4. System dynamically loads Form B based on contact type
5. User completes and submits the combined form
6. System creates:
   - Contact record
   - Updates collection record
7. User can select "Add Opportunity" or "Done"
Implementation:
javascript// Load contact form definition based on type
async function loadContactTypeForm(contactTypeId) {
  try {
    // Fetch the appropriate form definition
    const response = await fetch(`/api/form-definitions?entity_type=contact&entity_subtype_id=${contactTypeId}&form_level=TYPE`);
    const formDefinition = await response.json();
    
    if (formDefinition) {
      // Clear the dynamic portion of the form
      const dynamicFormContainer = document.getElementById('dynamic-fields-container');
      dynamicFormContainer.innerHTML = '';
      
      // Render the dynamic form based on JSON schema
      renderDynamicForm(formDefinition.form_schema, dynamicFormContainer);
      
      // Store form definition ID and version for submission
      document.getElementById('form_definition_id').value = formDefinition.id;
      document.getElementById('form_version').value = formDefinition.version;
    }
  } catch (error) {
    console.error('Error loading contact type form:', error);
    showErrorMessage('Failed to load contact type form. Please try again.');
  }
}

// Contact form submission handler
async function submitContactForm(formData) {
  try {
    // Separate standard fields from dynamic fields
    const standardFields = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      contact_type_id: formData.contact_type_id,
      collection_id: formData.collection_id,
      form_definition_id: formData.form_definition_id,
      form_version: formData.form_version
    };
    
    // All other fields go into metadata
    const metadata = {};
    Object.keys(formData).forEach(key => {
      if (!Object.keys(standardFields).includes(key)) {
        metadata[key] = formData[key];
      }
    });
    
    // Create contact record
    const contactResponse = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...standardFields,
        metadata: metadata
      })
    });
    
    const contactData = await contactResponse.json();
    
    // Set contact role if needed
    if (formData.contact_role) {
      await fetch('/api/collection-contact-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection_id: formData.collection_id,
          contact_id: contactData.id,
          role_type: formData.contact_role
        })
      });
    }
    
    // Determine next step based on user selection
    if (formData.next_action === 'add_opportunity') {
      window.location.href = `/collections/${formData.collection_id}/opportunities/new`;
    } else {
      window.location.href = `/collections/${formData.collection_id}`;
    }
    
  } catch (error) {
    console.error('Error submitting contact form:', error);
    showErrorMessage('Failed to save contact. Please try again.');
  }
}
3. Opportunity Entry Workflow (Multi-Layer Dynamic Form)
1. User selects "Add New Opportunity" from collection view
2. System presents static Form A for opportunities (common fields)
3. User selects business category (Insurance/Retail)
4. System adds category-specific fields
5. User selects opportunity_type_id (Roofing, Siding, etc.)
6. System adds type-specific fields
7. User completes and submits the combined form
8. System creates:
   - Opportunity record
   - Updates collection
Implementation:
javascript// Load business category form
async function loadBusinessCategoryForm(categoryId) {
  try {
    const response = await fetch(`/api/form-definitions?entity_type=opportunity&category_id=${categoryId}&form_level=CATEGORY`);
    const formDefinition = await response.json();
    
    if (formDefinition) {
      // Render category-specific fields
      const categoryFormContainer = document.getElementById('category-fields-container');
      categoryFormContainer.innerHTML = '';
      
      renderDynamicForm(formDefinition.form_schema, categoryFormContainer);
      
      // Store category form details
      document.getElementById('category_form_id').value = formDefinition.id;
      document.getElementById('category_form_version').value = formDefinition.version;
      
      // Update opportunity types dropdown based on selected category
      loadOpportunityTypeOptions(categoryId);
    }
  } catch (error) {
    console.error('Error loading business category form:', error);
    showErrorMessage('Failed to load category form. Please try again.');
  }
}

// Load opportunity type form
async function loadOpportunityTypeForm(opportunityTypeId, categoryId) {
  try {
    const response = await fetch(`/api/form-definitions?entity_type=opportunity&entity_subtype_id=${opportunityTypeId}&category_id=${categoryId}&form_level=TYPE`);
    const formDefinition = await response.json();
    
    if (formDefinition) {
      // Render type-specific fields
      const typeFormContainer = document.getElementById('type-fields-container');
      typeFormContainer.innerHTML = '';
      
      renderDynamicForm(formDefinition.form_schema, typeFormContainer);
      
      // Store type form details
      document.getElementById('type_form_id').value = formDefinition.id;
      document.getElementById('type_form_version').value = formDefinition.version;
    }
  } catch (error) {
    console.error('Error loading opportunity type form:', error);
    showErrorMessage('Failed to load opportunity type form. Please try again.');
  }
}

// Opportunity form submission handler
async function submitOpportunityForm(formData) {
  try {
    // Separate standard fields from dynamic fields
    const standardFields = {
      opportunity_type_id: formData.opportunity_type_id,
      status: formData.status || 'ACTIVE',
      notes: formData.notes,
      collection_id: formData.collection_id,
      // Store references to all form definitions used
      form_definitions: [
        { id: formData.base_form_id, version: formData.base_form_version },
        { id: formData.category_form_id, version: formData.category_form_version },
        { id: formData.type_form_id, version: formData.type_form_version }
      ]
    };
    
    // All other fields go into metadata
    const metadata = {};
    Object.keys(formData).forEach(key => {
      if (!Object.keys(standardFields).includes(key) && 
          !key.endsWith('_form_id') && 
          !key.endsWith('_form_version')) {
        metadata[key] = formData[key];
      }
    });
    
    // Create opportunity record
    const opportunityResponse = await fetch('/api/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...standardFields,
        metadata: metadata
      })
    });
    
    const opportunityData = await opportunityResponse.json();
    
    // Redirect to collection view
    window.location.href = `/collections/${formData.collection_id}`;
    
  } catch (error) {
    console.error('Error submitting opportunity form:', error);
    showErrorMessage('Failed to save opportunity. Please try again.');
  }
}
4. Document Creation Workflow (Drag & Drop Builder)
1. User selects "Create Estimate" from collection view
2. System presents template selection or blank canvas
3. User adds components via drag & drop:
   - Line items
   - Photo galleries
   - Material selections
   - Customer approval
4. For each component, user can:
   - Configure component settings
   - Import data from existing entities
   - Enter new data
5. User arranges layout visually
6. User saves or publishes the document
7. System creates document record
Implementation:
javascript// Initialize document builder
function initDocumentBuilder(templateId = null) {
  const builder = document.getElementById('document-builder');
  const componentLibrary = document.getElementById('component-library');
  const propertiesPanel = document.getElementById('properties-panel');
  
  // Load component library
  loadComponentLibrary(componentLibrary);
  
  // Set up drag and drop
  setupDragAndDrop(builder, componentLibrary, propertiesPanel);
  
  // If template provided, load it
  if (templateId) {
    loadDocumentTemplate(templateId, builder);
  }
}

// Load component library
async function loadComponentLibrary(container) {
  try {
    const response = await fetch('/api/document-components');
    const components = await response.json();
    
    // Render component library
    components.forEach(component => {
      const componentEl = document.createElement('div');
      componentEl.className = 'component-item';
      componentEl.draggable = true;
      componentEl.dataset.componentType = component.component_type;
      componentEl.dataset.componentId = component.id;
      componentEl.innerHTML = `
        <i class="icon-${component.component_type}"></i>
        <span>${component.name}</span>
      `;
      
      // Add drag start event
      componentEl.addEventListener('dragstart', handleDragStart);
      
      container.appendChild(componentEl);
    });
  } catch (error) {
    console.error('Error loading component library:', error);
    showErrorMessage('Failed to load components. Please try again.');
  }
}

// Handle component drop on builder
function handleComponentDrop(event, builderEl) {
  event.preventDefault();
  
  const componentType = event.dataTransfer.getData('component-type');
  const componentId = event.dataTransfer.getData('component-id');
  
  // Create component instance
  createComponentInstance(componentType, componentId, builderEl);
}

// Create component instance
async function createComponentInstance(componentType, componentId, container) {
  try {
    // Fetch component definition
    const response = await fetch(`/api/document-components/${componentId}`);
    const component = await response.json();
    
    // Create component element
    const componentEl = document.createElement('div');
    componentEl.className = 'document-component';
    componentEl.dataset.componentType = componentType;
    componentEl.dataset.componentId = componentId;
    
    // Render component content based on type
    if (componentType === 'line_items') {
      renderLineItemsComponent(componentEl, component);
    } else if (componentType === 'photo_gallery') {
      renderPhotoGalleryComponent(componentEl, component);
    } else if (componentType === 'data_import') {
      showDataImportDialog(componentEl, component);
    } else {
      renderGenericComponent(componentEl, component);
    }
    
    // Add to builder container
    container.appendChild(componentEl);
    
    // Show properties panel for this component
    showComponentProperties(componentEl, component);
    
  } catch (error) {
    console.error('Error creating component instance:', error);
    showErrorMessage('Failed to create component. Please try again.');
  }
}

// Show data import dialog
function showDataImportDialog(componentEl, componentDef) {
  // Create dialog for selecting data source
  const dialog = document.createElement('div');
  dialog.className = 'data-import-dialog';
  dialog.innerHTML = `
    <h3>Import Data</h3>
    <div class="form-group">
      <label>Source Type:</label>
      <select id="source-type">
        <option value="contact">Contact</option>
        <option value="opportunity">Opportunity</option>
        <option value="address">Address</option>
      </select>
    </div>
    <div class="form-group">
      <label>Select Source:</label>
      <div id="source-entities"></div>
    </div>
    <div class="form-group">
      <label>Select Fields:</label>
      <div id="source-fields"></div>
    </div>
    <div class="buttons">
      <button id="import-cancel">Cancel</button>
      <button id="import-confirm">Import</button>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  // Set up event handlers
  document.getElementById('source-type').addEventListener('change', function() {
    loadSourceEntities(this.value);
  });
  
  document.getElementById('import-cancel').addEventListener('click', function() {
    document.body.removeChild(dialog);
    container.removeChild(componentEl);
  });
  
  document.getElementById('import-confirm').addEventListener('click', function() {
    const sourceType = document.getElementById('source-type').value;
    const sourceId = document.querySelector('input[name="source-entity"]:checked').value;
    const selectedFields = Array.from(
      document.querySelectorAll('input[name="source-field"]:checked')
    ).map(el => el.value);
    
    // Configure component with import settings
    componentEl.dataset.sourceType = sourceType;
    componentEl.dataset.sourceId = sourceId;
    componentEl.dataset.sourceFields = JSON.stringify(selectedFields);
    
    // Load the actual data
    loadSourceData(componentEl, sourceType, sourceId, selectedFields);
    
    document.body.removeChild(dialog);
  });
  
  // Initial load of entities
  loadSourceEntities('contact');
}

// Save the entire document
async function saveDocument(documentType) {
  try {
    // Collect all component data
    const components = Array.from(
      document.querySelectorAll('#document-builder .document-component')
    ).map(el => {
      return {
        component_type: el.dataset.componentType,
        component_id: el.dataset.componentId,
        display_order: Array.from(el.parentNode.children).indexOf(el),
        config: JSON.parse(el.dataset.config || '{}'),
        content: JSON.parse(el.dataset.content || '{}'),
        source_reference: el.dataset.sourceType ? {
          source_type: el.dataset.sourceType,
          source_id: el.dataset.sourceId,
          fields: JSON.parse(el.dataset.sourceFields || '[]')
        } : null
      };
    });
    
    // Create document layout
    const layout = {
      components: components.map(c => ({
        id: c.component_id,
        type: c.component_type,
        display_order: c.display_order,
        config: c.config
      }))
    };
    
    // Create document content
    const content = {
      components: components.map(c => ({
        id: c.component_id,
        content: c.content,
        source_reference: c.source_reference
      }))
    };
    
    // Submit document
    const response = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('document-name').value,
        document_type: documentType,
        document_template_id: document.getElementById('template-id').value || null,
        collection_id: document.getElementById('collection-id').value,
        opportunity_id: document.getElementById('opportunity-id').value || null,
        status: 'DRAFT',
        layout: layout,
        content: content
      })
    });
    
    const documentData = await response.json();
    
    // Redirect to document view
    window.location.href = `/documents/${documentData.id}`;
    
  } catch (error) {
    console.error('Error saving document:', error);
    showErrorMessage('Failed to save document. Please try again.');
  }
}
Form Builder Implementation
javascript// Initialize form builder
function initFormBuilder(formType, formLevel) {
  const builder = document.getElementById('form-builder');
  const componentLibrary = document.getElementById('component-library');
  const propertiesPanel = document.getElementById('properties-panel');
  
  // Load field library
  loadFieldLibrary(componentLibrary);
  
  // Set up drag and drop
  setupDragAndDrop(builder, componentLibrary, propertiesPanel);
  
  // Initialize form properties
  document.getElementById('form-type').value = formType;
  document.getElementById('form-level').value = formLevel;
}

// Load field library
async function loadFieldLibrary(container) {
  try {
    const response = await fetch('/api/form-components');
    const components = await response.json();
    
    // Render component library
    components.forEach(component => {
      const componentEl = document.createElement('div');
      componentEl.className = 'component-item';
      componentEl.draggable = true;
      componentEl.dataset.componentType = component.component_type;
      componentEl.dataset.componentId = component.id;
      componentEl.innerHTML = `
        <i class="icon-${component.component_type}"></i>
        <span>${component.name}</span>
      `;
      
      // Add drag start event
      componentEl.addEventListener('dragstart', handleDragStart);
      
      container.appendChild(componentEl);
    });
  } catch (error) {
    console.error('Error loading field library:', error);
    showErrorMessage('Failed to load fields. Please try again.');
  }
}

// Save form definition
async function saveFormDefinition() {
  try {
    // Collect all field data
    const fields = Array.from(
      document.querySelectorAll('#form-builder .form-field')
    ).map(el => {
      return {
        field_id: el.dataset.fieldId,
        field_type: el.dataset.fieldType,
        name: el.dataset.fieldName,
        label: el.dataset.fieldLabel,
        required: el.dataset.fieldRequired === 'true',
        config: JSON.parse(el.dataset.config || '{}'),
        display_order: Array.from(el.parentNode.children).indexOf(el)
      };
    });
    
    // Create form schema
    const formSchema = {
      title: document.getElementById('form-name').value,
      description: document.getElementById('form-description').value,
      type: 'object',
      properties: {},
      required: []
    };
    
    // Add fields to schema
    fields.forEach(field => {
      formSchema.properties[field.name] = {
        type: getJsonSchemaType(field.field_type),
        title: field.label,
        ...field.config
      };
      
      if (field.required) {
        formSchema.required.push(field.name);
      }
    });
    
    // Submit form definition
    const response = await fetch('/api/form-definitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('form-name').value,
        description: document.getElementById('form-description').value,
        entity_type_id: document.getElementById('entity-type-id').value,
        entity_subtype_id: document.getElementById('entity-subtype-id').value || null,
        category_id: document.getElementById('category-id').value || null,
        form_level: document.getElementById('form-level').value,
        form_schema: formSchema,
        is_active: true,
        is_public: document.getElementById('is-public').checked
      })
    });
    
    const formData = await response.json();
    
    // Redirect to form list
    window.location.href = '/form-definitions';
    
  } catch (error) {
    console.error('Error saving form definition:', error);
    showErrorMessage('Failed to save form. Please try again.');
  }
}
This is the complete implementation of your advanced form system. With this architecture:

You can create dynamic forms for contacts and opportunities based on their types
You can add specialized sections like photos and documents to any form
You can build drag-and-drop estimates and reports that import data from your records
Every form and component can be saved as a template and reused
You have full version control for all form definitions
The system is designed for sharing between organizations