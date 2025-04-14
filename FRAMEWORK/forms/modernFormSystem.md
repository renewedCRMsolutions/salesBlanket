# Modern Form System: Implementation & Flow Guide

## Overview

The form system you've implemented enables dynamic, versioned forms that can be customized at organization, department, and entity levels. This guide explains how the system works in practice, particularly for opportunity creation.

### How It Works

- Form Definitions and Versioning

- Forms are defined in the form_definitions table

Each form has a unique ID, name, and JSON schema
Forms belong to a specific organization, department, and entity type
Forms can be active or inactive, deleted or not

Form versions are tracked in the form_versions table

Every change to a form creates a new version
Old versions are preserved for backward compatibility
Records store which version of a form they were created with

Forms are accessible based on permissions

The form_access_controls table defines who can see or edit which forms
Integration with your existing permissions system

Opportunity Creation Flow
Step 1: Address Entry (Form Part A)

User enters address information
System creates address record
System creates collection record (if new)

Step 2: Contact Selection/Creation (Form Part B/C)

User selects existing contacts or creates new ones
New contacts are associated with the collection

Step 3: Opportunity Selection (New Step)

System presents available opportunity forms based on:

User's department
User's permissions
Entity type (opportunity)


User selects the appropriate form type (e.g., Storm Damage)

Step 4: Dynamic Opportunity Form (Form Part D)

System loads the selected form definition
Form is rendered dynamically based on the JSON schema
User completes and submits the form
Data is saved:

Standard fields to the opportunities table
Dynamic fields to the metadata JSON field
Form definition ID and version are recorded



Example: Storm Damage Opportunity
Form Selection
When a user reaches the opportunity creation step, they're presented with form options like:

Storm Damage Assessment
Roofing Repair
Siding Installation
Solar Installation

Let's say they select "Storm Damage Assessment".
Form Loading

System fetches the latest version of the Storm Damage form
The form is rendered dynamically based on the JSON schema
Fields are organized into tabs and sections as defined in the schema

Field Types and Media Handling
The Storm Damage form includes specialized fields for media:

Photo Upload Fields
json"exterior_photos": {
  "type": "photo_upload",
  "label": "Exterior Damage Photos",
  "required": true,
  "multipleAllowed": true,
  "maxPhotos": 10
}
This renders as a photo uploader component that:

Allows the user to take or upload photos
Stores photos in your existing entity_photos table
Links the photos to the opportunity record


Photo Annotation Fields
json"photo_annotations": {
  "type": "photo_annotation",
  "label": "Annotated Damage Assessment",
  "required": true,
  "sourceFields": ["exterior_photos", "interior_photos"]
}
This renders as an annotation tool that:

Shows photos from the specified source fields
Allows drawing, measurement, and text markup
Saves annotations to your database



Form Submission
When the user submits the form:

Standard opportunity fields are saved to the opportunities table
Custom form data is saved to the metadata JSONB field
The form definition ID and version are recorded with the opportunity
Any uploaded photos or documents are processed

Prerequisite Forms
In some workflows, you might need forms to be completed before reaching the opportunity stage. Here's how to handle that:
Approach 1: Sequential Forms

Define a workflow sequence in your app
Each form in the sequence must be completed before moving to the next
Forms can be for different entity types (address, contact, opportunity)
Track completion status in the collection record

Approach 2: Conditional Rendering

Include all necessary fields in a single form
Use conditional logic to show/hide sections based on previous answers
Example: Show insurance fields only if "Insurance Claim Filed" is true

Approach 3: Form Dependencies

Define dependencies between forms in the form schema
When loading a form, check if dependencies are satisfied
If not, redirect to complete prerequisite forms first

Implementation Example
Here's a JavaScript example of how to load and render a dynamic form:
javascript// Fetch the appropriate form definition
async function loadOpportunityForm(formId) {
  try {
    // Get form definition
    const response = await fetch(`/api/form-definitions/${formId}`);
    const formDefinition = await response.json();
    
    // Render the form
    renderDynamicForm(formDefinition.form_schema);
    
    // Store the form ID and version for submission
    sessionStorage.setItem('currentFormId', formDefinition.id);
    sessionStorage.setItem('currentFormVersion', formDefinition.version);
  } catch (error) {
    console.error('Error loading form:', error);
  }
}

// Submit the completed form
async function submitOpportunityForm(formData) {
  try {
    const formId = sessionStorage.getItem('currentFormId');
    const formVersion = sessionStorage.getItem('currentFormVersion');
    
    // Prepare submission data
    const submissionData = {
      opportunity_type_id: formData.opportunity_type_id,
      status: formData.status || 'ACTIVE',
      notes: formData.notes,
      collection_id: currentCollectionId,
      form_definition_id: formId,
      form_version: formVersion,
      metadata: extractDynamicFormData(formData)
    };
    
    // Submit the form
    const response = await fetch('/api/opportunities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submissionData)
    });
    
    // Handle success
    if (response.ok) {
      // Redirect to the new opportunity
      const result = await response.json();
      window.location.href = `/opportunities/${result.id}`;
    }
  } catch (error) {
    console.error('Error submitting form:', error);
  }
}
Storm Damage Form Example
Form Schema
json{
  "metadata": {
    "version": 1,
    "formType": "opportunity",
    "category": "Insurance"
  },
  "layout": {
    "type": "tabs",
    "tabs": [
      {
        "id": "basic_info",
        "label": "Basic Information",
        "order": 1,
        "sections": [
          {
            "id": "customer_info",
            "label": "Customer Information",
            "order": 1,
            "fields": ["damage_date", "damage_type", "claim_filed"]
          },
          {
            "id": "insurance_info",
            "label": "Insurance Details",
            "order": 2,
            "fields": ["insurance_company", "policy_number", "deductible_amount"],
            "conditional": {
              "field": "claim_filed",
              "operator": "equals",
              "value": true
            }
          }
        ]
      },
      {
        "id": "damage_assessment",
        "label": "Damage Assessment",
        "order": 2,
        "sections": [
          {
            "id": "damage_photos",
            "label": "Damage Photos",
            "order": 1,
            "fields": ["exterior_photos", "interior_photos"]
          },
          {
            "id": "annotated_photos",
            "label": "Damage Markup",
            "order": 2,
            "fields": ["photo_annotations"]
          }
        ]
      },
      {
        "id": "estimate",
        "label": "Repair Estimate",
        "order": 3,
        "sections": [
          {
            "id": "materials",
            "label": "Materials",
            "order": 1,
            "fields": ["material_list"]
          },
          {
            "id": "labor",
            "label": "Labor",
            "order": 2,
            "fields": ["labor_estimate"]
          },
          {
            "id": "total",
            "label": "Total Estimate",
            "order": 3,
            "fields": ["estimate_total", "customer_approval"]
          }
        ]
      }
    ]
  },
  "fields": {
    "damage_date": {
      "type": "date",
      "label": "Date of Damage",
      "required": true
    },
    "damage_type": {
      "type": "multi_select",
      "label": "Type of Damage",
      "required": true,
      "options": ["Wind", "Hail", "Flooding", "Lightning", "Fallen Tree", "Fire", "Other"]
    },
    "claim_filed": {
      "type": "boolean",
      "label": "Insurance Claim Filed?",
      "required": true,
      "default": false
    },
    "insurance_company": {
      "type": "select",
      "label": "Insurance Company",
      "required": true,
      "options": ["State Farm", "Allstate", "Farmers", "Liberty Mutual", "USAA", "Progressive", "Other"]
    },
    "policy_number": {
      "type": "text",
      "label": "Policy Number",
      "required": true
    },
    "deductible_amount": {
      "type": "currency",
      "label": "Deductible Amount",
      "required": true,
      "default": 0
    },
    "exterior_photos": {
      "type": "photo_upload",
      "label": "Exterior Damage Photos",
      "required": true,
      "multipleAllowed": true,
      "maxPhotos": 10
    },
    "interior_photos": {
      "type": "photo_upload",
      "label": "Interior Damage Photos",
      "required": false,
      "multipleAllowed": true,
      "maxPhotos": 10
    },
    "photo_annotations": {
      "type": "photo_annotation",
      "label": "Annotated Damage Assessment",
      "required": true,
      "sourceFields": ["exterior_photos", "interior_photos"]
    },
    "material_list": {
      "type": "line_items",
      "label": "Materials Required",
      "required": true,
      "columns": [
        {
          "id": "item",
          "label": "Material",
          "type": "text",
          "required": true
        },
        {
          "id": "quantity",
          "label": "Quantity",
          "type": "number",
          "required": true
        },
        {
          "id": "unit_price",
          "label": "Unit Price",
          "type": "currency",
          "required": true
        },
        {
          "id": "total",
          "label": "Total",
          "type": "calculated",
          "formula": "quantity * unit_price"
        }
      ]
    },
    "labor_estimate": {
      "type": "line_items",
      "label": "Labor Costs",
      "required": true,
      "columns": [
        {
          "id": "description",
          "label": "Description",
          "type": "text",
          "required": true
        },
        {
          "id": "hours",
          "label": "Hours",
          "type": "number",
          "required": true
        },
        {
          "id": "rate",
          "label": "Hourly Rate",
          "type": "currency",
          "required": true
        },
        {
          "id": "total",
          "label": "Total",
          "type": "calculated",
          "formula": "hours * rate"
        }
      ]
    },
    "estimate_total": {
      "type": "calculated",
      "label": "Total Estimate",
      "formula": "SUM(material_list.total) + SUM(labor_estimate.total)",
      "displayAs": "currency"
    },
    "customer_approval": {
      "type": "signature",
      "label": "Customer Approval",
      "required": false
    }
  }
}
Loading The Form
When a user selects "Storm Damage Assessment" from the available opportunity forms, the app:

Loads the form definition by ID
Renders the form based on the schema
Initializes all form fields with default values
Sets up conditional rendering rules
Prepares specialized components for photo upload, annotation, etc.

Form Submission Result
When submitted, the form data is saved to the opportunities table:
opportunities table:
id: 12345678-90ab-cdef-1234-567890abcdef
opportunity_type_id: [storm damage type ID]
status: 'ACTIVE'
notes: 'Hail damage to roof and siding, customer filed USAA claim'
collection_id: [collection ID]
form_definition_id: [storm damage form ID]
form_version: 1
metadata: {
  "damage_date": "2023-07-15",
  "damage_type": ["Hail", "Wind"],
  "claim_filed": true,
  "insurance_company": "USAA",
  "policy_number": "US123456789",
  "deductible_amount": 1000,
  "exterior_photos": ["photo1.jpg", "photo2.jpg"],
  "interior_photos": ["photo3.jpg"],
  "photo_annotations": {
    "photo1.jpg": [
      {"type": "arrow", "coords": [100, 200, 150, 250], "label": "Hail damage"}
    ]
  },
  "material_list": [
    {"item": "Shingles", "quantity": 20, "unit_price": 75, "total": 1500},
    {"item": "Siding panels", "quantity": 10, "unit_price": 25, "total": 250}
  ],
  "labor_estimate": [
    {"description": "Roof repair", "hours": 16, "rate": 75, "total": 1200},
    {"description": "Siding repair", "hours": 8, "rate": 75, "total": 600}
  ],
  "estimate_total": 3550
}
Next Steps

Frontend Component Development: Create UI components for each field type
Form Builder Interface: Develop an admin interface for creating/editing forms
Permission Configuration: Set up form access controls
Integration Testing: Test the full workflow from address to opportunity creation

How the Modern Form System Works
The system you've implemented provides:

Dynamic Forms: Forms defined in JSON that can change over time
Versioning: Old versions are preserved for backwards compatibility
Organization Hierarchy: Forms can be defined at organization, department, or entity type levels
Access Control: Forms integrated with your existing permissions system

Integration with Opportunity Creation
Your current opportunity creation follows a multi-step process:

Address Entry (Form Part A): User enters location information
Selection/Contact Creation (Form Part B/C): User creates/selects contacts
Opportunity Creation (Form Part D): This is where the new form system comes in

The new system enhances this flow by making the opportunity form dynamic and customizable.
How Forms Are Selected and Loaded
When a user reaches the opportunity creation step:

The system checks which forms they have access to based on:

Their department
Their permissions
The entity type (opportunity)


The user selects a form type (e.g., Storm Damage Assessment)
The system fetches the form definition from form_definitions and renders it dynamically
When the form is submitted, the system:

Saves standard fields to the opportunities table
Saves dynamic fields to the metadata JSON field
Records which form definition and version was used



Storm Damage Form Implementation Example
To implement the Storm Damage form:

First, insert the form definition:

sqlINSERT INTO public.form_definitions (
  organization_id,
  department_id,
  entity_type_id,
  name,
  description,
  form_schema,
  is_active,
  created_by
) VALUES (
  (SELECT id FROM public.organizations LIMIT 1),
  (SELECT id FROM public.departments LIMIT 1),
  (SELECT id FROM public.entity_types WHERE display_name = 'opportunity'),
  'Storm Damage Assessment',
  'Form for processing storm damage insurance claims',
  '{
    "metadata": {
      "version": 1,
      "formType": "opportunity"
    },
    "layout": {
      "type": "tabs",
      "tabs": [
        {
          "id": "basic_info",
          "label": "Basic Information",
          "fields": ["damage_date", "damage_type", "claim_filed"]
        },
        {
          "id": "damage_details",
          "label": "Damage Details",
          "fields": ["exterior_photos", "photo_annotations"]
        }
      ]
    },
    "fields": {
      "damage_date": {
        "type": "date",
        "label": "Date of Damage",
        "required": true
      },
      "damage_type": {
        "type": "multi_select",
        "label": "Type of Damage",
        "options": ["Wind", "Hail", "Flooding", "Lightning", "Fallen Tree"],
        "required": true
      },
      "claim_filed": {
        "type": "boolean",
        "label": "Insurance Claim Filed?",
        "default": false
      },
      "exterior_photos": {
        "type": "photo_upload",
        "label": "Exterior Damage Photos",
        "required": true,
        "multipleAllowed": true
      },
      "photo_annotations": {
        "type": "photo_annotation",
        "label": "Damage Markup",
        "sourceFields": ["exterior_photos"]
      }
    }
  }'::jsonb,
  true,
  (SELECT id FROM public.users LIMIT 1)
);

Front-end implementation for selecting the form:

javascript// When the user reaches the opportunity creation step
async function loadOpportunityForms() {
  // Fetch available forms based on permissions
  const response = await fetch('/api/form-definitions?entity_type=opportunity');
  const forms = await response.json();
  
  // Display form options to user
  const formSelector = document.getElementById('form-selector');
  forms.forEach(form => {
    const option = document.createElement('option');
    option.value = form.id;
    option.textContent = form.name;
    formSelector.appendChild(option);
  });
  
  // Add change handler
  formSelector.addEventListener('change', (e) => {
    const selectedFormId = e.target.value;
    if (selectedFormId) {
      loadForm(selectedFormId);
    }
  });
}

// Load the selected form
async function loadForm(formId) {
  const response = await fetch(`/api/form-definitions/${formId}`);
  const formDefinition = await response.json();
  
  // Render the form dynamically based on the schema
  renderDynamicForm(formDefinition.form_schema);
  
  // Store form ID and version for submission
  document.getElementById('form-definition-id').value = formDefinition.id;
  document.getElementById('form-version').value = formDefinition.version;
}

When the form is submitted:

javascriptasync function submitOpportunityForm(event) {
  event.preventDefault();
  
  // Gather standard fields
  const opportunityData = {
    opportunity_type_id: document.getElementById('opportunity-type-id').value,
    status: 'ACTIVE',
    notes: document.getElementById('notes').value,
    collection_id: currentCollectionId,
    form_definition_id: document.getElementById('form-definition-id').value,
    form_version: document.getElementById('form-version').value,
    metadata: gatherDynamicFormData() // Custom function to collect dynamic fields
  };
  
  // Submit data
  const response = await fetch('/api/opportunities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opportunityData)
  });
  
  if (response.ok) {
    const result = await response.json();
    window.location.href = `/opportunities/${result.id}`;
  }
}
Handling Pre-Opportunity Forms
If you need forms to be completed before the opportunity step:

Track progress in the collection record: Add a completed_steps array to track which forms have been completed
Check prerequisites when loading forms: Before showing the opportunity form, check if required steps are complete:

javascriptfunction checkPrerequisites(collectionId) {
  return fetch(`/api/collections/${collectionId}`)
    .then(response => response.json())
    .then(collection => {
      const completedSteps = collection.completed_steps || [];
      const requiredSteps = ['address', 'contact'];
      
      const missingSteps = requiredSteps.filter(step => !completedSteps.includes(step));
      
      if (missingSteps.length > 0) {
        // Redirect to the first missing step
        window.location.href = `/collections/${collectionId}/step/${missingSteps[0]}`;
        return false;
      }
      
      return true;
    });
}

Update collection record after each step: After completing a form, update the collection:

javascriptfunction markStepComplete(collectionId, step) {
  return fetch(`/api/collections/${collectionId}/steps/${step}`, {
    method: 'POST'
  });
}
I've created a detailed implementation guide as an artifact that provides more information on the form system, including the complete Storm Damage form schema and integration examples.
Would you like me to elaborate on any specific aspect of the implementation?RWthe contact form should also change with the contactso let me get this UI right..   we can have the contact table do its thing with the name, email, and then they pick the contact type they want... then the form for THAT type pops up... so like on contact type selection is the listrener in the code to trigger the render?  dynamic afthats so good.  can we do that?can i set this up on my website too.. the same form system????Yes, absolutely! You can definitely have the contact form change dynamically based on the selected contact type. That's one of the most powerful features of this form system!
Here's how the dynamic contact form would work:

The user starts with a basic contact form (name, email, etc.)
When they select a contact type from the dropdown, the system:

Fetches the appropriate form schema for that contact type
Dynamically renders additional fields specific to that type
Maintains the values already entered in the basic fields



The implementation would look something like this:
javascript// When contact type dropdown changes
document.getElementById('contact_type_id').addEventListener('change', function(e) {
  const contactTypeId = e.target.value;
  if (contactTypeId) {
    // Fetch the form definition for this contact type
    fetch(`/api/form-definitions?entity_type=contact&type_id=${contactTypeId}`)
      .then(response => response.json())
      .then(formDef => {
        if (formDef && formDef.form_schema) {
          // Save current values
          const currentValues = collectFormValues();
          
          // Render the type-specific form
          renderDynamicForm(formDef.form_schema);
          
          // Restore previously entered values
          restoreFormValues(currentValues);
          
          // Store form ID and version for submission
          document.getElementById('form_definition_id').value = formDef.id;
          document.getElementById('form_version').value = formDef.version;
        }
      });
  }
});
This is exactly the kind of dynamic user experience you're describing - "dynamic af" indeed! The form adapts in real-time as users make selections.
As for using this on your website - yes, you absolutely can! This form system is designed to work anywhere you can run JavaScript. You could:

Create a standalone form builder/renderer for your website
Build a headless API that serves form definitions
Create a JavaScript library that renders forms based on these schemas

The form system is completely platform-agnostic since the definitions are just JSON. You could have the exact same form render on your salesBlanket app, your public website, a mobile app, or even in emails or PDFs.
Would you like me to create a more detailed example of how the contact type-specific forms would work?

Understanding Your Form System
Based on your documentation, you're building a dynamic form system that:

Uses JSON schemas to define form structures stored in a form_definitions table
Tracks form versions to maintain backward compatibility
Integrates with your existing sales engine
Allows for organization/department/entity hierarchy for form access
Creates a dynamic UI where form fields can change based on user selections

Your system appears particularly focused on sales processes, with forms for opportunities, contacts, and products that can be used to build estimates for customers.
Your Question About Pricing
You asked: "Can we have the pricing come from somewhere other than in the jsonb with this method?"
Yes, absolutely! The form definition (stored as JSONB) doesn't have to contain the actual pricing data. It should only define the structure of the form and reference where to get pricing data.
Better Approach for Pricing
Instead of storing pricing directly in the form's JSONB data, you can:

Store pricing in dedicated tables (which you already seem to have with tables like sales_engine_item_zones)
Reference these tables in your form definitions, like this:

json"material_list": {
  "type": "line_items",
  "label": "Materials Required",
  "required": true,
  "data_source": {
    "table": "sales_engine_items",
    "filters": {
      "item_type_id": "{{selected_item_type}}",
      "zone_id": "{{customer_zone_id}}"
    }
  },
  "columns": [...]
}

Create a pricing service/API that the form renderer calls to get real-time pricing data based on:

Product selections
Customer location (zone-based pricing)
Current promotions
Volume discounts
Other business rules



Implementation Example
Here's how you could implement this:

Form Definition - Define the structure but not the prices:

javascript"roofing_materials": {
  "type": "product_selector",
  "label": "Roofing Materials",
  "product_type_id": "roofing",
  "display_fields": ["name", "description", "image"],
  "pricing_handler": "getRoofingPricing"
}

Pricing Handler - Create a function to fetch real-time pricing:

javascriptasync function getRoofingPricing(productId, formData) {
  // Get relevant data from the form
  const squareFootage = formData.roof_measurements.area;
  const zoneId = formData.customer_address.zone_id;
  
  // Call your pricing service/API
  const response = await fetch(`/api/pricing/roofing/${productId}?area=${squareFootage}&zone=${zoneId}`);
  return response.json();
}

Backend Pricing Service - Implement an API that calculates prices based on your business rules:

javascript// Simplified example of a pricing endpoint
app.get('/api/pricing/roofing/:productId', async (req, res) => {
  const { productId } = req.params;
  const { area, zone } = req.query;
  
  // Get base product data
  const product = await db.query(
    'SELECT * FROM sales_engine_items WHERE id = $1',
    [productId]
  );
  
  // Get zone-specific pricing
  const zonePricing = await db.query(
    'SELECT * FROM sales_engine_item_zones WHERE item_id = $1 AND zone_id = $2',
    [productId, zone]
  );
  
  // Calculate final pricing based on business rules
  const basePrice = zonePricing.price_per_unit * area;
  const volume_discount = area > 2000 ? 0.1 : 0;
  
  // Return complete pricing information
  res.json({
    product_id: productId,
    base_price: basePrice,
    discount_percentage: volume_discount,
    final_price: basePrice * (1 - volume_discount),
    // Include any other relevant pricing data
  });
});
Benefits of This Approach

Separation of Concerns - Form definitions define structure, pricing logic lives elsewhere
Real-time Pricing - Always get the latest pricing data when needed
Centralized Business Rules - Maintain pricing logic in one place
Flexibility - Change pricing strategies without updating form definitions
Zone-based Pricing - Maintain your existing zone-based model
Historical Records - Store a snapshot of pricing at time of form submission, but generate it from your pricing tables

This approach fully aligns with your existing sales engine structure while making your form system more maintainable and flexible.
Would you like me to elaborate on any specific aspect of this pricing integration approach?