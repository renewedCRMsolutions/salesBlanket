# data Propagation


## Entity Selection

For the entity flow, yes, the architecture works like this:

The system first accesses the collection (as the parent container)
From the collection, it retrieves all associated entity IDs
These entity IDs then inform what's displayed in entity cards

This collection-first approach provides better performance and organization since:

Collections act as the unifying container
You can fetch all related entities in a single query
Cards can be aggregated at the collection level and then filtered

For storm damage photos, I recommend implementing a specialized module: