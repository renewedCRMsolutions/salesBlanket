Yes, storing location_geo is different from duplicating the entire street geometry. The point geometry in addresses serves a specific purpose:

location_geo stores a single point (the exact position of the address)
Street geometries store entire line segments (the complete street path)

This isn't problematic duplication because:

The address point provides precise location for the building/property
The street line provides routing information and context
They serve different purposes in spatial queries

This hybrid approach gives you the best of both worlds - precise address locations while maintaining the relationship to streets for neighborhood associations and routing.RetryRWso when one address is added, we can leverage that to add the entire street?EditYes, when one address is added, you can leverage that information to add the entire street. This approach is efficient for building your spatial database:

When a user adds an address with complete information, extract the street details
Check if the street already exists in your database
If not, create the street record and generate its geometry
Link the address to the street

An implementation could use a trigger function:
sqlCREATE OR REPLACE FUNCTION create_street_from_address()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if street exists
  IF NOT EXISTS (SELECT 1 FROM streets WHERE name = NEW.street) THEN
    -- Create street record
    INSERT INTO streets (
      id, name, city, state, zip_code, geometry_data, created_at, updated_at
    ) VALUES (
      uuid_generate_v4(), 
      NEW.street,
      NEW.city,
      NEW.state,
      NEW.postal_code,
      -- Get geometry from Google Maps API or another geocoding service
      NULL, -- Will be populated by separate process
      NOW(),
      NOW()
    ) RETURNING id INTO NEW.street_id;
    
    -- Trigger async task to populate street geometry
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
This creates a normalized data structure with minimal duplication while maintaining spatial functionality.RetryRWa street_id cannot be created without the creation of an addressEditIn our database model, we need to handle the fact that a street_id requires an address first. We can implement this with:

A function that creates streets based on address data at insertion time
No separate street creation pathway that doesn't involve addresses

This approach avoids orphaned streets while maintaining data integrity. The implementation would:

Add street creation logic to the address insertion flow
Link new addresses to existing streets when appropriate
Ensure the street_id in addresses is always valid

This meets your architectural requirement while keeping the spatial relationship intact.RetryRWmy only issue - we will have salesWarBoard allow the creation of records by way of drawing a zone and then getting a return of all the address points in the boundary - we then have a load process we follow.  in this instance, to be sure, we would get a return of the data needed for the address and not the data we are using for the streets right?  how much does the geometry data cost?EditThe geometry data storage cost is minimal compared to its value. When drawing zones in salesWarBoard:

You'll get back address points (location_geo) within boundaries
Street geometries aren't returned unless specifically requested
PostgreSQL efficiently stores geometry data (typically kilobytes per street)

For loading addresses from zone selections:

Address points capture exact locations
Street relationships can be derived from those points
Full street geometries can be populated later via a background process

The primary storage costs are:

Point geometries for addresses: ~40 bytes each
Line geometries for streets: ~100-500 bytes each depending on complexity

This approach balances spatial functionality with storage efficiency.