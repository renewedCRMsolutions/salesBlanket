# SalesBlanket Documentation Standards

This document defines standard documentation formats for all code components in the SalesBlanket application.

## File Header Documentation

Every file should have a consistent header:

```javascript
/**
 * @file [path/to/file.js]
 * @description Brief description of the file's purpose
 * @module [module name]
 * @author [optional author name]
 * @last-modified [YYYY-MM-DD]
 */
```

## Service Documentation

Services should document their singleton nature and responsibilities:

```javascript
/**
 * @service EntityService
 * @description Manages entity data operations and state
 * @singleton
 * 
 * @dependencies {DataService, UserSettingsService} - Other services this service depends on
 * 
 * @publicMethods
 * - getEntities(type: string, filters: object): Promise<Entity[]>
 * - createEntity(type: string, data: object): Promise<Entity>
 * - updateEntity(type: string, id: string, data: object): Promise<Entity>
 * - deleteEntity(type: string, id: string): Promise<boolean>
 * 
 * @state
 * - cachedEntities: Object - Cached entity data by type
 * - lastRefresh: Object - Timestamp of last data refresh by type
 * 
 * @events
 * - entityCreated - Dispatched when a new entity is created
 * - entityUpdated - Dispatched when an entity is updated
 * - entityDeleted - Dispatched when an entity is deleted
 */
```

## Component Documentation

```javascript
/**
 * @component EntityListView
 * @extends BaseView
 * @description Displays a list of entities with filtering and sorting
 * 
 * @dependencies {EntityService, FilterService} - Services this component uses
 * 
 * @props
 * - entityType: string - Type of entities to display
 * - filters: object - Initial filter criteria
 * - showSearch: boolean - Whether to show search bar
 * 
 * @state
 * - entities: Array - Current list of entities
 * - loading: boolean - Loading state
 * - error: string - Error message, if any
 * 
 * @events
 * - entity-selected - Dispatched when user selects an entity
 * - filter-changed - Dispatched when filters are modified
 * 
 * @slots
 * - header - Optional header content
 * - entity-item - Custom entity item template
 * - footer - Optional footer content
 */
```

## Route Documentation

```javascript
/**
 * @route GET /api/entity_types
 * @description Retrieves all entity types
 * 
 * @clientUsage
 * - Called by: EntityService.getEntityTypes()
 * - Used in: EntityTypeFilter, EntityForm
 * 
 * @params
 * - isActive: boolean [optional] - Filter by active status
 * 
 * @returns {Array<EntityType>} List of entity types
 * 
 * @example
 * // Example response
 * [
 *   { id: "ET_0001", name: "Customer", isActive: true },
 *   { id: "ET_0002", name: "Prospect", isActive: true }
 * ]
 */
```

## Function Documentation

```javascript
/**
 * @function createServiceProxy
 * @description Creates a proxy wrapper around a service to enable debugging
 * 
 * @param {Object} service - The service to proxy
 * @param {string} moduleName - Identifier for the module in debug logs
 * 
 * @returns {Proxy} Proxied service with debug capabilities
 * 
 * @example
 * const debugEntityService = createServiceProxy(entityService, 'EntityService');
 */
```

## Method Documentation Within Classes

```javascript
/**
 * @method getEntitiesByParent
 * @description Retrieves entities filtered by a parent entity
 * 
 * @param {string} entityType - Type of entities to retrieve
 * @param {string} parentType - Type of parent entity
 * @param {string} parentId - ID of parent entity
 * @param {Object} [options={}] - Additional options
 * @param {boolean} [options.includeInactive=false] - Whether to include inactive entities
 * @param {string} [options.sortBy='name'] - Field to sort by
 * 
 * @returns {Promise<Array>} List of matching entities
 * 
 * @throws {Error} If entityType or parentId is invalid
 * 
 * @fires entityListLoaded - When entities are successfully retrieved
 */
```

## Event Documentation

```javascript
/**
 * @event entity-selected
 * @description Fired when a user selects an entity in the UI
 * 
 * @property {string} entityId - ID of the selected entity
 * @property {string} entityType - Type of the selected entity
 * @property {Object} entityData - Complete entity data object
 * 
 * @example
 * document.addEventListener('entity-selected', (e) => {
 *   console.log('Selected entity:', e.detail.entityId);
 * });
 */
```