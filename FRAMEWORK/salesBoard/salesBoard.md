# salesBoard UI

How do we create data in the salesBoard?

We follow our propagation.

Entity-First Approach

Creation form ->

1. User logged in as a user in web app.
    Use collections search up an address, opportunity, or marketer to add the new entity to the existing collection

2. Website.

    Customer can enter address to get a quote -> this creates an address record and collection
    Create entity records first (address, contact, or marketer)

Collection record created when entity is created.

When creating related entities (opportunity), search existing records to link
Collection acts as container for all our entities to present consumable data.

Creation Logic

Frontend validation to check for existing entities
Suggest matches during creation (not database-level)
User explicitly confirms relationships during creation

Merge Strategy

If we have two collections that have entities that need to be married we allow the collections to be merged.

Implement collection merge with warnings
Two-stage confirmation for irreversible operations
Logging system for merge audit trail