Reusable Components & Entity Relationships
When you create an estimate and want to pull data from a contact type form, the relationship would work like this:

Entity References in Components
Each component in an estimate/report would have a "data source" configuration that specifies:

Which entity type (contact, opportunity, address)
Which specific entity instance (by ID)
Which data fields to pull



For example:
json{
  "component_type": "contact_details",
  "data_source": {
    "entity_type": "contact",
    "entity_id": "abc123",
    "fields": ["first_name", "last_name", "metadata.insurance_info"]
  }
}

Multiple Contacts on Collection

This is an important point - when you have multiple contacts on a collection, you need to know which one to reference. There are a few approaches:

Contact Role Table: Add a table that defines roles for contacts within a collection:

sqlCREATE TABLE public.collection_contact_roles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id uuid REFERENCES public.collections(id),
    contact_id uuid REFERENCES public.contacts(id),
    role_type varchar(50) NOT NULL, -- 'PRIMARY', 'SPOUSE', 'AGENT', etc.
    created_at timestamptz DEFAULT now()
);

Explicit Selection: When building an estimate, the user explicitly selects which contact to reference

Either way, when importing data into an estimate/report, the system needs to store which specific contact was used as the source, so that relationship is maintained.
Form Builder Interface for Different Component Types
The form builder would need different interfaces for:

Base Form Builder (for standard entity forms)

- Form Type Selection (Address, Contact, Opportunity)
- Add standard fields (drag & drop from library)
- Set required/optional status
- Set field order
- Configure validation rules

Type-Specific Form Builder

- Select entity type (Contact, Opportunity)
- Select subtype (Contact Type or Opportunity Type)
- Add type-specific fields
- Configure conditional logic (show/hide based on other fields)
- Define default values

Specialized Section Builder

- Select section type (Photos, Documents, Measurements, etc.)
- Configure section properties:
  * For Photos: max count, categories, annotation options
  * For Measurements: units, calculation formulas
  * For Documents: file types, max size
- Add validation rules
- Define layout options

Output Document Builder (Estimates, Reports)

- Select document type
- Add components (drag & drop)
- Configure data sources:
  * Select entity type
  * Select specific entity from collection
  * Select fields to import
- Arrange layout (grid/columns)
- Configure calculations and formulas
- Set styles (fonts, colors, etc.)
Implementation Strategy
To make this system work, your code will need to:

Query the Right Forms:

javascript// Get the appropriate form definition based on entity type and subtype
async function getFormDefinition(entityType, entitySubtype, category = null) {
  // Get base form
  const baseFormQuery = {
    entity_type: entityType,
    form_level: 'BASE'
  };
  const baseForm = await db.query('SELECT * FROM form_definitions WHERE ?', baseFormQuery);
  
  // Get type-specific form
  const typeFormQuery = {
    entity_type: entityType,
    entity_subtype_id: entitySubtype,
    form_level: 'TYPE'
  };
  const typeForm = await db.query('SELECT * FROM form_definitions WHERE ?', typeFormQuery);
  
  // Get category form if applicable
  let categoryForm = null;
  if (category) {
    const categoryFormQuery = {
      entity_type: entityType,
      category_id: category,
      form_level: 'CATEGORY'
    };
    categoryForm = await db.query('SELECT * FROM form_definitions WHERE ?', categoryFormQuery);
  }
  
  // Merge the forms in correct order (base → category → type)
  return mergeFormDefinitions([baseForm, categoryForm, typeForm].filter(Boolean));
}

Resolve Entity References:

javascript// When building an estimate, resolve entity references
async function resolveEntityReference(collection_id, entity_type, role = null) {
  let entities;
  
  if (entity_type === 'contact') {
    // Get contacts for this collection, possibly filtered by role
    const query = {
      collection_id: collection_id
    };
    if (role) {
      entities = await db.query(`
        SELECT c.* FROM contacts c
        JOIN collection_contact_roles r ON c.id = r.contact_id
        WHERE r.collection_id = ? AND r.role_type = ?
      `, [collection_id, role]);
    } else {
      entities = await db.query('SELECT * FROM contacts WHERE collection_id = ?', [collection_id]);
    }
  } else if (entity_type === 'opportunity') {
    // Get opportunities for this collection
    entities = await db.query('SELECT * FROM opportunities WHERE collection_id = ?', [collection_id]);
  } else if (entity_type === 'address') {
    // Get addresses for this collection
    entities = await db.query('SELECT * FROM addresses WHERE collection_id = ?', [collection_id]);
  }
  
  // If multiple entities found, return list for user selection
  // If only one found, return it directly
  return entities;
}

Import Entity Data:

javascript// Import data from an entity into an estimate component
function importEntityData(entity, component_config) {
  const { fields } = component_config.data_source;
  const result = {};
  
  // Extract standard fields
  fields.forEach(field => {
    if (!field.includes('.')) {
      // Standard field
      result[field] = entity[field];
    } else {
      // Path into metadata
      const [base, ...path] = field.split('.');
      if (base === 'metadata' && entity.metadata) {
        let value = entity.metadata;
        for (const key of path) {
          value = value[key];
          if (value === undefined) break;
        }
        result[path.join('_')] = value;
      }
    }
  });
  
  return result;
}
This gives you the foundation for how the code will:

Find the appropriate forms
Resolve entity references when multiple entities exist
Extract and import data from entities into components