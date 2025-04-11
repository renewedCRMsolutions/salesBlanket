# Data Propagation and Entity Lifecycle Management

This document outlines how data propagates through the SalesBlanket v4 database when entities are created, related, and deleted. It ensures data integrity by preventing orphaned records and maintaining proper relationship chains.

## Entity Creation and Relationship Propagation

```mermaid
flowchart TD
    %% Main entity creation flows
    subgraph Creation["Entity Creation Flow"]
        Collection["Collection Created"]
        Address["Address Created"]
        Contact["Contact Created"]
        Opportunity["Opportunity Created"]
        
        Collection --> |"triggers"| Address
        Address --> |"can lead to"| Contact
        Address --> |"can lead to"| Opportunity
        Contact --> |"can lead to"| Opportunity
    end
    
    %% Junction table creation 
    subgraph Junction["Junction Table Creation"]
        AC["Address-Contact Link Created"]
        AO["Address-Opportunity Link Created"]
        CO["Contact-Opportunity Link Created"]
        
        Address --> |"enables"| AC
        Contact --> |"enables"| AC
        
        Address --> |"enables"| AO
        Opportunity --> |"enables"| AO
        
        Contact --> |"enables"| CO
        Opportunity --> |"enables"| CO
    end
    
    %% Required relationships
    Address -.->|"requires"| Collection
    Contact -.->|"requires"| Collection
    Opportunity -.->|"requires"| Collection
    
    %% Style definitions
    classDef primary fill:#f9f,stroke:#333,stroke-width:2px;
    classDef secondary fill:#bbf,stroke:#333,stroke-width:1px;
    classDef junction fill:#dfd,stroke:#333,stroke-width:1px;
    
    class Collection,Address,Contact,Opportunity primary;
    class AC,AO,CO junction;
```

## Entity Deletion and Cascade Effects

```mermaid
flowchart TD
    %% Main entity deletion scenarios
    subgraph Deletion["Entity Deletion Scenarios"]
        direction TB
        DelCollection["Collection Deletion\n(Blocked if entities exist)"]
        DelAddress["Address Deletion\n(Cascades to junctions)"]
        DelContact["Contact Deletion\n(Cascades to junctions)"]
        DelOpportunity["Opportunity Deletion\n(Cascades to junctions)"]
    end
    
    %% Junction table effects
    subgraph Junction["Junction Table Effects"]
        DelAC["Address-Contact Links Deleted"]
        DelAO["Address-Opportunity Links Deleted"]
        DelCO["Contact-Opportunity Links Deleted"]
    end
    
    %% Cascade flows for Address deletion
    DelAddress --> |"CASCADE"| DelAC
    DelAddress --> |"CASCADE"| DelAO
    
    %% Cascade flows for Contact deletion
    DelContact --> |"CASCADE"| DelAC
    DelContact --> |"CASCADE"| DelCO
    
    %% Cascade flows for Opportunity deletion
    DelOpportunity --> |"CASCADE"| DelAO
    DelOpportunity --> |"CASCADE"| DelCO
    
    %% Restricted deletions
    AddressExists["Addresses Exist"] -->|"RESTRICT"| DelCollection
    ContactExists["Contacts Exist"] -->|"RESTRICT"| DelCollection
    OpportunityExists["Opportunities Exist"] -->|"RESTRICT"| DelCollection
    
    %% Style definitions
    classDef deletion fill:#ffcccc,stroke:#333,stroke-width:2px;
    classDef junction fill:#dfd,stroke:#333,stroke-width:1px;
    classDef restriction fill:#ffffcc,stroke:#333,stroke-width:1px;
    
    class DelCollection,DelAddress,DelContact,DelOpportunity deletion;
    class DelAC,DelAO,DelCO junction;
    class AddressExists,ContactExists,OpportunityExists restriction;
```

## LEGO Block Analogy for Data Building

In our database design, we use a "LEGO block" approach to data building:

1. **Foundation Block (Collection)**: Every data structure begins with a Collection
2. **Primary Blocks (Entities)**: Addresses, Contacts, and Opportunities attach to Collections
3. **Connection Blocks (Junctions)**: Address-Contact, Address-Opportunity, and Contact-Opportunity links connect entities together
4. **Structural Integrity**: Rules prevent removing foundation blocks while structures are built on top

```mermaid
graph TD
    %% Base Collection with entities
    Collection["Collection\n(Foundation)"] --- Address["Address\n(Primary Block)"]
    Collection --- Contact["Contact\n(Primary Block)"]
    Collection --- Opportunity["Opportunity\n(Primary Block)"]
    
    %% Junction relationships
    Address --- AC["Address-Contact\n(Connection)"]
    Contact --- AC
    
    Address --- AO["Address-Opportunity\n(Connection)"]
    Opportunity --- AO
    
    Contact --- CO["Contact-Opportunity\n(Connection)"]
    Opportunity --- CO
    
    %% Style definitions
    classDef foundation fill:#f9d5e5,stroke:#333,stroke-width:3px;
    classDef primary fill:#eeac99,stroke:#333,stroke-width:2px;
    classDef connection fill:#e06377,stroke:#333,stroke-width:1px;
    
    class Collection foundation;
    class Address,Contact,Opportunity primary;
    class AC,AO,CO connection;
```

## Entity Lifecycle State Transitions

```mermaid
stateDiagram-v2
    [*] --> CollectionCreated: Start
    
    state "Collection Created" as CollectionCreated
    state "Address Added" as AddressAdded
    state "Contact Added" as ContactAdded
    state "Opportunity Added" as OpportunityAdded
    state "Relationships Established" as RelationshipsEstablished
    
    CollectionCreated --> AddressAdded: Add address
    AddressAdded --> ContactAdded: Add contact
    ContactAdded --> OpportunityAdded: Add opportunity
    AddressAdded --> OpportunityAdded: Add opportunity directly
    
    OpportunityAdded --> RelationshipsEstablished: Link entities
    ContactAdded --> RelationshipsEstablished: Link entities 
    
    state RelationshipsEstablished {
        [*] --> Active
        Active --> Modified: Update relationships
        Modified --> Active: Stabilize
        Active --> Inactive: Deactivate
        Inactive --> Active: Reactivate
    }
    
    RelationshipsEstablished --> CollectionDeleted: Delete restrictions satisfied
    
    state "Collection Deleted" as CollectionDeleted
    CollectionDeleted --> [*]: End
```

## Preventing Orphaned Records

### Orphan Prevention Mechanisms

1. **Foreign Key Constraints**:
   - All entity tables (addresses, contacts, opportunities) have foreign keys to their collection
   - Junction tables have properly configured foreign keys to their parent entities

2. **ON DELETE Actions**:
   - RESTRICT: Prevents deletion of a collection if dependent entities exist
   - CASCADE: Automatically removes junction records when a parent entity is deleted

3. **Application-Level Validation**:
   - Ensures new entities are always associated with a valid collection
   - Verifies relationship integrity before allowing entity creation

### Orphan Detection and Resolution

```mermaid
flowchart TD
    %% Orphan detection process
    subgraph Detection["Orphan Detection Process"]
        FindOrphans["Find records missing required relationships"]
        ValidateFK["Validate foreign key references"]
        CheckConsistency["Check data consistency"]
    end
    
    %% Resolution strategies
    subgraph Resolution["Resolution Strategies"]
        CreateLinks["Create missing relationships"]
        AssignDefault["Assign to default collection"]
        LogAndFlag["Log and flag for review"]
        Delete["Delete orphaned records"]
    end
    
    %% Workflow
    Detection --> |"if orphans found"| Resolution
    Resolution --> |"after resolution"| Verification
    
    %% Verification process
    subgraph Verification["Verification Process"]
        Recheck["Re-run detection queries"]
        Confirm["Confirm database integrity"]
        Document["Document resolution actions"]
    end
    
    %% Style definitions
    classDef detection fill:#f9d5e5,stroke:#333,stroke-width:2px;
    classDef resolution fill:#eeac99,stroke:#333,stroke-width:2px;
    classDef verification fill:#e06377,stroke:#333,stroke-width:2px;
    
    class FindOrphans,ValidateFK,CheckConsistency detection;
    class CreateLinks,AssignDefault,LogAndFlag,Delete resolution;
    class Recheck,Confirm,Document verification;
```

## Database Trigger System for Data Propagation

For automated data integrity and propagation, the system implements database triggers:

1. **BEFORE INSERT Triggers**:
   - Validate that required related entities exist
   - Generate any required default values or relationships

2. **AFTER INSERT Triggers**:
   - Create complementary records in related tables
   - Update statistical counters and aggregates

3. **BEFORE DELETE Triggers**:
   - Check if deletion would violate integrity constraints
   - Prepare related data for cascading operations

4. **AFTER DELETE Triggers**:
   - Clean up any remaining references
   - Update statistical counters and aggregates

This comprehensive approach ensures data integrity throughout the entity lifecycle, preventing orphaned records while enabling the flexible "building block" approach to data construction.