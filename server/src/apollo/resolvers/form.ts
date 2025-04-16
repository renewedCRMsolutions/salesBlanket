import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { Context } from '../context';

// Define interfaces for form types
interface FormLookupArgs {
  addressTypeId?: string;
  contactTypeId?: string;
  opportunityTypeId?: string;
  entitySubtypeId?: string;
}

interface FormSubmissionInput {
  formDefinitionId: string;
  formVersion: number;
  entityId?: string;
  entityType?: string;
  addressTypeId?: string;
  contactTypeId?: string;
  opportunityTypeId?: string;
  collectionId?: string;
  formData: any;
  createCollection?: boolean;
}

// Helper function to initialize collection pulse - moved to the top to avoid reference errors
async function initializeCollectionPulse(context: Context, collectionId: string): Promise<void> {
  // Create pulse items for different pulse types
  const pulseTypes = ['PHOTO', 'DOCUMENT', 'EMAIL', 'TASK', 'CALENDAR'];
  
  for (const pulseType of pulseTypes) {
    await context.db.query(`
      INSERT INTO collection_pulse (
        collection_id,
        pulse_type,
        content,
        status,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, '{}', 'ACTIVE', NOW(), NOW()
      )
    `, [collectionId, pulseType]);
  }
}

export const formResolvers = {
  Query: {
    formDefinitions: async (_parent: any, { isActive }: { isActive?: boolean }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        let query = `SELECT * FROM form_definitions`;
        const params = [];
        
        if (isActive !== undefined) {
          query += ` WHERE is_active = $1`;
          params.push(isActive);
        }
        
        query += ` ORDER BY name`;
        
        const result = await context.db.query(query, params);
        return result.rows;
      } catch (error: any) {
        throw new Error(`Failed to fetch form definitions: ${error.message}`);
      }
    },
    
    lookupFormsByEntityType: async (_parent: any, args: FormLookupArgs, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      const { 
        addressTypeId, 
        contactTypeId,
        opportunityTypeId,
        entitySubtypeId
      } = args;
      
      try {
        let query = `
          SELECT 
            efm.id,
            efm.form_definition_id as "formDefinitionId",
            efm.entity_type_id as "entityTypeId",
            efm.address_type_id as "addressTypeId",
            efm.contact_type_id as "contactTypeId",
            efm.entity_subtype_id as "entitySubtypeId",
            efm.opportunity_type_id as "opportunityTypeId",
            efm.auto_bypass_subtype as "autoBypassSubtype",
            efm.is_default as "isDefault",
            efm.display_order as "displayOrder",
            fd.name as "formName",
            fd.form_schema as "formSchema",
            fd.description as "formDescription"
          FROM 
            entity_form_mappings efm
          JOIN
            form_definitions fd ON efm.form_definition_id = fd.id
          WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;
        
        if (addressTypeId) {
          query += ` AND efm.address_type_id = $${paramIndex++}`;
          params.push(addressTypeId);
        }
        
        if (contactTypeId) {
          query += ` AND efm.contact_type_id = $${paramIndex++}`;
          params.push(contactTypeId);
        }
        
        if (opportunityTypeId) {
          query += ` AND efm.opportunity_type_id = $${paramIndex++}`;
          params.push(opportunityTypeId);
        }
        
        if (entitySubtypeId) {
          query += ` AND efm.entity_subtype_id = $${paramIndex++}`;
          params.push(entitySubtypeId);
        }
        
        query += ` AND fd.is_active = true`;
        query += ` ORDER BY efm.display_order, efm.is_default DESC`;
        
        const result = await context.db.query(query, params);
        return result.rows;
      } catch (error: any) {
        throw new Error(`Failed to lookup forms by entity type: ${error.message}`);
      }
    }
  },
  
  Mutation: {
    submitForm: async (_parent: any, { input }: { input: FormSubmissionInput }, context: Context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to perform this action');
      }
      
      try {
        // Start a transaction
        await context.db.query('BEGIN');
        
        // Validate the form exists
        const formResult = await context.db.query(`
          SELECT * FROM form_definitions WHERE id = $1 AND version = $2
        `, [input.formDefinitionId, input.formVersion]);
        
        if (formResult.rows.length === 0) {
          throw new UserInputError('Form definition not found or version mismatch');
        }
        
        const formDefinition = formResult.rows[0];
        
        // Process the form submission based on entity type
        let entityId = input.entityId;
        let entityType = input.entityType;
        let collectionId = input.collectionId;
        
        // Based on the type of entity, process accordingly
        if (input.addressTypeId) {
          // Address creation
          const addressResult = await context.db.query(`
            INSERT INTO addresses (
              display_name,
              street,
              address_line_2,
              city,
              state,
              postal_code,
              notes,
              property_condition,
              next_knock_date,
              address_type_id,
              collection_id,
              status,
              metadata,
              created_by
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
            ) RETURNING *
          `, [
            input.formData.displayName || null,
            input.formData.street,
            input.formData.addressLine2 || null,
            input.formData.city || null,
            input.formData.state || null,
            input.formData.postalCode || null,
            input.formData.notes || null,
            input.formData.propertyCondition || {},
            input.formData.nextKnockDate || null,
            input.addressTypeId,
            collectionId,
            'ACTIVE',
            input.formData,
            context.user?.id
          ]);
          
          const address = addressResult.rows[0];
          entityId = address.id;
          entityType = 'address';
          
          // Create collection if requested and not provided
          if (input.createCollection && !collectionId) {
            const collectionResult = await context.db.query(`
              INSERT INTO collections (
                name,
                status,
                metadata,
                created_by
              ) VALUES (
                $1, $2, $3, $4
              ) RETURNING *
            `, [
              address.street,
              'ACTIVE',
              { source: 'form_submission', entityType: 'address' },
              context.user?.id
            ]);
            
            const collection = collectionResult.rows[0];
            collectionId = collection.id;
            
            // Update the address with the collection ID
            await context.db.query(`
              UPDATE addresses SET collection_id = $1 WHERE id = $2
            `, [collectionId, address.id]);
            
            // Add null check before calling initializeCollectionPulse
            if (collectionId) {
              await initializeCollectionPulse(context, collectionId);
            }
          }
        } // Added the missing closing bracket here
        
        // Store form submission record
        if (entityId) {
          await context.db.query(`
            INSERT INTO form_submissions (
              form_definition_id,
              form_version,
              entity_id,
              entity_type,
              collection_id,
              form_data,
              submitted_by,
              submitted_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, NOW()
            )
          `, [
            input.formDefinitionId,
            input.formVersion,
            entityId,
            entityType,
            collectionId,
            input.formData,
            context.user?.id
          ]);
        }
        
        // Commit the transaction
        await context.db.query('COMMIT');
        
        return {
          success: true,
          entityId,
          entityType,
          collectionId,
          errors: null,
          message: 'Form submitted successfully'
        };
      } catch (error: any) {
        // Rollback the transaction on error
        await context.db.query('ROLLBACK');
        console.error('Form submission error:', error);
        
        return {
          success: false,
          entityId: null,
          entityType: null,
          collectionId: null,
          errors: [error.message],
          message: 'Form submission failed'
        };
      }
    }
  }
};