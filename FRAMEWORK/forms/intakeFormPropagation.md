# Record Propagation Implementation

Record propagation is the process of creating and connecting related records when a user submits a form. Here's a comprehensive implementation plan for how data flows through your system:

Address Form Submitted:

Create Address Record

Insert into addresses table
Auto-generate UUID for id
Set name = value of street
Set status = 'ACTIVE'
Set next_knock_date to +7 days from current date

Create Streets Record

Insert into streets table if street doesn't exist
Set the street_id on the address record

Create Collection Record

Insert into collections table
Set collection name to address street
Set status = 'ACTIVE'
Update the address record with collection_id

Check Neighborhood

Look for matching neighborhood based on street
If found, update address with neighborhood_id

Contact Form Submitted:

Create Contact Record

Insert into contacts table
Auto-generate UUID for id
Store standard fields (name, email, etc.)
Store type-specific form data in metadata JSON field
Set collection_id to connect to existing collection

Create Contact Role (Optional)

If role is specified, insert into collection_contact_roles
Link contact to collection with specific role

Update Collection Record

Update updated_at timestamp on collection

Opportunity Form Submitted:

Create Opportunity Record

Insert into opportunities table
Auto-generate UUID for id
Store base fields like opportunity_type_id, status, notes
Store dynamic form data in metadata JSON field
Set form_definition_id and form_version
Set collection_id to connect to existing collection

Process Attachments (If Any)

If photos uploaded, create records in entity_photos
If documents uploaded, create records in entity_documents

Update Collection Record

Update updated_at timestamp on collection

Document (Estimate/Report) Created:

Create Document Record

Insert into documents table
Auto-generate UUID for id
Set document_type (estimate, inspection, report)
Save layout and content in separate JSON fields
Link to collection via collection_id
Link to opportunity via opportunity_id if applicable

Create Document Components

For each component in the document:

Insert into document_components
Link to document via document_id
Store component configuration and content

Create Data Source References

For each data source used in the document:

Insert into data_source_references
Link source entity to document component

1. Address Entry Propagation

When a user submits an address form, the following propagation occurs:

async function propagateAddressRecord(addressData) {
  try {
    // 1. Create streets record if it doesn't exist
    const streetsResponse = await fetch('/api/streets/find-or-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        street_name: addressData.street,
        city: addressData.city,
        state: addressData.state,
        postal_code: addressData.postal_code
      })
    });

    const streetsData = await streetsResponse.json();
    
    // 2. Update address with street_id
    await fetch(`/api/addresses/${addressData.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        street_id: streetsData.id
      })
    });
    
    // 3. Check if neighborhood exists for this street
    const neighborhoodResponse = await fetch(`/api/neighborhoods/by-street/${streetsData.id}`);
    const neighborhoodData = await neighborhoodResponse.json();
    
    if (neighborhoodData) {
      // Update address with neighborhood_id
      await fetch(`/api/addresses/${addressData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          neighborhood_id: neighborhoodData.id
        })
      });
    }
    
    // 4. Create collection record
    const collectionResponse = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: addressData.street, // Default name to street address
        status: 'ACTIVE',
        created_by: getCurrentUserId()
      })
    });
    
    const collectionData = await collectionResponse.json();
    
    // 5. Link address to collection
    await fetch(`/api/addresses/${addressData.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection_id: collectionData.id
      })
    });
    
    return collectionData;
  } catch (error) {
    console.error('Error in address propagation:', error);
    throw new Error('Failed to complete address record propagation');
  }
}
2. Contact Record Propagation
When a user submits a contact form:
async function propagateContactRecord(contactData, collectionId) {
  try {
    // 1. Create contact record
    const contactResponse = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: contactData.first_name,
        last_name: contactData.last_name,
        email: contactData.email,
        contact_type_id: contactData.contact_type_id,
        collection_id: collectionId,
        // Dynamic form fields go into metadata
        metadata: contactData.metadata,
        form_definition_id: contactData.form_definition_id,
        form_version: contactData.form_version,
        created_by: getCurrentUserId()
      })
    });
    
    const newContactData = await contactResponse.json();
    
    // 2. Create contact role if specified
    if (contactData.role_type) {
      await fetch('/api/collection-contact-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection_id: collectionId,
          contact_id: newContactData.id,
          role_type: contactData.role_type
        })
      });
    }
    
    // 3. Update collection with contact reference
    await fetch(`/api/collections/${collectionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        updated_at: new Date().toISOString()
      })
    });
    
    return newContactData;
  } catch (error) {
    console.error('Error in contact propagation:', error);
    throw new Error('Failed to complete contact record propagation');
  }
}
3. Opportunity Record Propagation
When a user submits an opportunity form:
async function propagateOpportunityRecord(opportunityData, collectionId) {
  try {
    // 1. Determine work type based on opportunity type if needed
    let workTypeId = null;
    if (opportunityData.opportunity_type_id) {
      const workTypeResponse = await fetch(`/api/work-types/by-opportunity-type/${opportunityData.opportunity_type_id}`);
      const workTypeData = await workTypeResponse.json();
      if (workTypeData) {
        workTypeId = workTypeData.id;
      }
    }
    
    // 2. Create opportunity record
    const opportunityResponse = await fetch('/api/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        opportunity_type_id: opportunityData.opportunity_type_id,
        work_type_id: workTypeId,
        status: opportunityData.status || 'ACTIVE',
        notes: opportunityData.notes,
        collection_id: collectionId,
        // Store form references
        form_definition_ids: opportunityData.form_definition_ids,
        // Dynamic form fields go into metadata
        metadata: opportunityData.metadata,
        created_by: getCurrentUserId()
      })
    });
    
    const newOpportunityData = await opportunityResponse.json();
    
    // 3. Update collection with opportunity reference
    await fetch(`/api/collections/${collectionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        updated_at: new Date().toISOString()
      })
    });
    
    // 4. If there are any document/photo uploads in the metadata, process them
    if (opportunityData.metadata) {
      await processOpportunityAttachments(newOpportunityData.id, opportunityData.metadata);
    }
    
    return newOpportunityData;
  } catch (error) {
    console.error('Error in opportunity propagation:', error);
    throw new Error('Failed to complete opportunity record propagation');
  }
}

// Helper function to process attachments
async function processOpportunityAttachments(opportunityId, metadata) {
  // Identify photo and document fields
  const photoFields = [];
  const documentFields = [];
  
  // Scan metadata for photo and document fields
  Object.keys(metadata).forEach(key => {
    if (key.includes('photos') || key.includes('images')) {
      photoFields.push(key);
    } else if (key.includes('documents') || key.includes('files')) {
      documentFields.push(key);
    }
  });
  
  // Process photo uploads
  for (const field of photoFields) {
    const photos = metadata[field];
    if (Array.isArray(photos)) {
      for (const photo of photos) {
        await fetch('/api/entity-photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entity_id: opportunityId,
            entity_type: 'opportunity',
            photo_url: photo.url,
            caption: photo.caption || '',
            field_name: field
          })
        });
      }
    }
  }
  
  // Process document uploads
  for (const field of documentFields) {
    const documents = metadata[field];
    if (Array.isArray(documents)) {
      for (const document of documents) {
        await fetch('/api/entity-documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entity_id: opportunityId,
            entity_type: 'opportunity',
            document_url: document.url,
            filename: document.filename || '',
            description: document.description || '',
            field_name: field
          })
        });
      }
    }
  }
}
4. Document Record Propagation
When a user creates a document (estimate, inspection, report):
async function propagateDocumentRecord(documentData) {
  try {
    // 1. Create document record
    const documentResponse = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: documentData.name,
        document_type: documentData.document_type,
        document_template_id: documentData.document_template_id,
        collection_id: documentData.collection_id,
        opportunity_id: documentData.opportunity_id,
        status: documentData.status || 'DRAFT',
        layout: documentData.layout,
        content: documentData.content,
        created_by: getCurrentUserId()
      })
    });
    
    const newDocumentData = await documentResponse.json();
    
    // 2. Create document components
    if (documentData.components && Array.isArray(documentData.components)) {
      for (const component of documentData.components) {
        await fetch('/api/document-components', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_id: newDocumentData.id,
            component_type: component.component_type,
            display_order: component.display_order,
            config: component.config,
            content: component.content,
            source_reference: component.source_reference
          })
        });
      }
    }
    
    // 3. Process data source references
    if (documentData.data_sources && Array.isArray(documentData.data_sources)) {
      for (const source of documentData.data_sources) {
        await fetch('/api/data-source-references', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target_id: newDocumentData.id,
            target_type: 'document',
            source_id: source.source_id,
            source_type: source.source_type,
            source_form_id: source.source_form_id,
            data_path: source.data_path
          })
        });
      }
    }
    
    // 4. Update collection with document reference
    await fetch(`/api/collections/${documentData.collection_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        updated_at: new Date().toISOString()
      })
    });
    
    return newDocumentData;
  } catch (error) {
    console.error('Error in document propagation:', error);
    throw new Error('Failed to complete document record propagation');
  }
}

5. Database Triggers for Additional Propagation

For certain automations, database triggers can be more efficient and reliable:

sql-- Trigger: Update collection when new entity is added

CREATE OR REPLACE FUNCTION update_collection_on_entity_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the collection's updated_at timestamp
  UPDATE public.collections
  SET updated_at = NOW()
  WHERE id = NEW.collection_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to addresses
CREATE TRIGGER trigger_address_update_collection
AFTER INSERT OR UPDATE ON public.addresses
FOR EACH ROW
WHEN (NEW.collection_id IS NOT NULL)
EXECUTE FUNCTION update_collection_on_entity_change();

-- Apply trigger to contacts
CREATE TRIGGER trigger_contact_update_collection
AFTER INSERT OR UPDATE ON public.contacts
FOR EACH ROW
WHEN (NEW.collection_id IS NOT NULL)
EXECUTE FUNCTION update_collection_on_entity_change();

-- Apply trigger to opportunities
CREATE TRIGGER trigger_opportunity_update_collection
AFTER INSERT OR UPDATE ON public.opportunities
FOR EACH ROW
WHEN (NEW.collection_id IS NOT NULL)
EXECUTE FUNCTION update_collection_on_entity_change();

-- Trigger: Update linked entities when collection changes
CREATE OR REPLACE FUNCTION update_entities_on_collection_merge()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a collection merge, update all linked entities
  IF NEW.merged_into_id IS NOT NULL AND OLD.merged_into_id IS NULL THEN
    -- Update addresses
    UPDATE public.addresses
    SET collection_id = NEW.merged_into_id
    WHERE collection_id = NEW.id;
    
    -- Update contacts
    UPDATE public.contacts
    SET collection_id = NEW.merged_into_id
    WHERE collection_id = NEW.id;
    
    -- Update opportunities
    UPDATE public.opportunities
    SET collection_id = NEW.merged_into_id
    WHERE collection_id = NEW.id;
    
    -- Update documents
    UPDATE public.documents
    SET collection_id = NEW.merged_into_id
    WHERE collection_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to collections
CREATE TRIGGER trigger_update_entities_on_collection_merge
AFTER UPDATE ON public.collections
FOR EACH ROW
EXECUTE FUNCTION update_entities_on_collection_merge();
6. API Layer for Record Propagation
To make this propagation logic reusable across your application, create dedicated API endpoints:
javascript// Server-side implementation
app.post('/api/propagation/address', async (req, res) => {
  try {
    const addressData = req.body;
    
    // Validate required fields
    if (!addressData.street || !addressData.city || !addressData.state || !addressData.postal_code) {
      return res.status(400).json({ error: 'Missing required address fields' });
    }
    
    // Create address record
    const address = await db.query(
      'INSERT INTO public.addresses (street, address_line_2, city, state, postal_code, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [addressData.street, addressData.address_line_2, addressData.city, addressData.state, addressData.postal_code, req.user.id]
    );
    
    // Propagate address record
    const collection = await propagateAddressRecord(address);
    
    res.status(201).json({
      address: address,
      collection: collection,
      message: 'Address and related records created successfully'
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to create address and related records' });
  }
});

app.post('/api/propagation/contact', async (req, res) => {
  try {
    const { contactData, collectionId } = req.body;
    
    // Validate required fields
    if (!contactData.first_name || !contactData.last_name || !contactData.contact_type_id || !collectionId) {
      return res.status(400).json({ error: 'Missing required contact fields' });
    }
    
    // Propagate contact record
    const contact = await propagateContactRecord(contactData, collectionId);
    
    res.status(201).json({
      contact: contact,
      message: 'Contact and related records created successfully'
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to create contact and related records' });
  }
});

app.post('/api/propagation/opportunity', async (req, res) => {
  try {
    const { opportunityData, collectionId } = req.body;
    
    // Validate required fields
    if (!opportunityData.opportunity_type_id || !collectionId) {
      return res.status(400).json({ error: 'Missing required opportunity fields' });
    }
    
    // Propagate opportunity record
    const opportunity = await propagateOpportunityRecord(opportunityData, collectionId);
    
    res.status(201).json({
      opportunity: opportunity,
      message: 'Opportunity and related records created successfully'
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to create opportunity and related records' });
  }
});

app.post('/api/propagation/document', async (req, res) => {
  try {
    const documentData = req.body;
    
    // Validate required fields
    if (!documentData.name || !documentData.document_type || !documentData.collection_id) {
      return res.status(400).json({ error: 'Missing required document fields' });
    }
    
    // Propagate document record
    const document = await propagateDocumentRecord(documentData);
    
    res.status(201).json({
      document: document,
      message: 'Document and related records created successfully'
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to create document and related records' });
  }
});
7. Collection Merging Logic
When multiple entities need to be combined into a single collection:
async function mergeCollections(sourceCollectionId, targetCollectionId) {
  try {
    // 1. Fetch both collections to verify they exist
    const sourceResponse = await fetch(`/api/collections/${sourceCollectionId}`);
    const sourceCollection = await sourceResponse.json();
    
    const targetResponse = await fetch(`/api/collections/${targetCollectionId}`);
    const targetCollection = await targetResponse.json();
    
    if (!sourceCollection || !targetCollection) {
      throw new Error('One or both collections not found');
    }
    
    // 2. Update source collection with merged_into_id
    await fetch(`/api/collections/${sourceCollectionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merged_into_id: targetCollectionId,
        status: 'MERGED',
        updated_at: new Date().toISOString()
      })
    });
    
    // 3. Database triggers will handle updating all related entities
    
    // 4. Return the target collection
    return targetCollection;
  } catch (error) {
    console.error('Error in collection merge:', error);
    throw new Error('Failed to merge collections');
  }
}
Key Considerations for Record Propagation

Transaction Safety: All propagation operations should be wrapped in database transactions to ensure consistency.

Error Handling: Each step should have robust error handling to prevent partial propagation.
Idempotency: API endpoints should be designed to be idempotent (can be called multiple times with the same result).

Performance: For large propagation operations, consider using batch processing or queues.
Logging: Implement comprehensive logging for all propagation steps to aid in debugging.

This record propagation implementation ensures that all related records are created, updated, and linked correctly throughout your system. The combination of client-side functions, API endpoints, and database triggers provides a robust and flexible propagation mechanism that maintains data integrity across your complex form system.