# salesBlanket Forms

"ultimate B2B solution" statement? salesBlanket's value - a platform flexible enough to handle diverse business relationships while maintaining connections between marketing, sales, and fulfillment in one system, without the hassle.

Entity-First Approach

## Creation Form

RULES:

Creation Logic

Frontend validation to check for existing entities
Suggest matches during creation (not database-level)
User explicitly confirms relationships during creation

## Acronyms

address = a
neighborhoods = n
collections = c
property condition form = pcf
contacts = con

addresses, contacts, opportunities

column visibility
hidden = 1
shown = 2
expandable = 3

### Form Part A - Address

form a will gather data to create the Addresses record
H1 - "Address Entry"
Show the date on the top right - day of the work
top of form UI
toggle switch(t.s) to turn the google places auto address fill ON / OFF
t.s default = ON
form

table name addresses

2, a address_type_id = drop down "select address type" options are available based on cached data. address_types.name contains the human readable text
1, a.id = auto fill uuid
1, a.name = auto fill value of the a.street entry
2, a.street = REQ value, google auto search
2, a.address_line_2 = is nullable
2, a.city = req
2, a.state = req
2, a.postal_code = req
1, a.status = auto YES
1, a.next_knock_date = +7 days from timestampz default
1, a.location_geo = auto fill google places api return
1, a.street_id = auto on streets record creation
1, a.neighborhood_id = auto null - neighborhood_id creation uses street_id to find matching a.id and update record with FK n.id.
1, a.created_by = auto fill user.id with timestampz
1, a.created_at = auto timestampz
1, a.updated_at = auto timestampz
1, a.metadata = nullable for now
1, a.collection_id = on addresses record creation or a merger - FK returned from c.id.
3, a.property_condition_form = expandable - see below

Drop Down Form Expander
H1 "Property Condition Form"
toggle on header
footer has "property condition report" button that will expand to reveal the property condition form.
footer has a submit button as well.

drop downs
default to option "select condition"

"roof_condition"
severe, old, new, missing shingles
"steep_roof"
yes, no
"siding_condition"
old, new, missing siding
"gutter_condition"
falling down, old, new
"ice_dam"
yes, no

the PCF has a collapse button to exit the container.  the container expands and the submit button stays fixed and exposed while the PCF is expanded.

on cancel - form workflow killed - no records created

on submit

Form Propagation

create streets record
create collections record

### Form Part B - Selection

Three Buttons on form w/ search bar for entities to group on collections table.

Add New Opportunity
Add New Contact
Done

Add Existing Contact or Opportunity
Search Bar -> user can search existing opportunities, addresses, contacts

if selected -> miniRecord is displayed on the pop up form -> nothing is executed as user is given the opportunity to find more entities to add to the collection.

Possible results

User adds a contact record but wants to add an opportunity as well.
  UI executes collection with con.id and new a.id then taken to the opportunity form.
User adds second address but wants to add a contact as well.
  UI executes collection with a.id and new add.id then taken to the contact form.

User selects add new opportunity - taken to contact form first - form has skip to opportunity button.  
  Upon submit contact button click -or- skip button click the create opportunity form is activated.

See recordCreation.md for data on addresses, streets, opportunities, and collection records creation propagation and constraints.

### Form Part C Contact Form

2, con.cover_photo = connects to c.id by FK if available / will have default photo
1, con.id = auto fill
2, con.first_name = req
2, con.last_name = req
2, email = nullable - need to place verification standards on the input

2, con.contact_type_id = drop down "select contact type" options are available based on cached data. contact_types.name contains the human readable text
2, contact_approval = req YES / NO
2, linked-in = nullable - max 50 char
2, instagram = nullable - max 50 char
2, x = nullable - max 50 char
2, facebook = nullable - max 100 char
2, notes = nullable - max 50 char

1, con.created_by = auto fill, timestampz
1, con.updated_at = auto fill, timestampz
1, con.collection_id = auto from collection record creation or merger - FK returned from c.id.

the footer contains two buttons 

add opportunity
all done

#### UI

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

This puts relationship control with users while maintaining data integrity. Collection merges should have clear warnings but provide flexibility to combine related records when needed.RetryRWi mean maybe somebody enters an opportunity before - what if i allow the application to log a item to sell as the opportunity and then the addresses are where items are sent and contacts are the interested buyers, or maybe the opportunity is a website and the contacts are the visitors and the addresses are the IP address and such.. salesBlanket covers it all..   simple, effective for that connection between marketing, the sale, and the retailer..  is that almost a mission statement... wowEditYou've just articulated a powerful mission statement for SalesBlanket. The flexibility to handle different business scenarios is exactly what makes your platform valuable:

Retail: Opportunity (product) → Addresses (delivery) → Contacts (buyers)
Web Business: Opportunity (website) → Addresses (IP locations) → Contacts (visitors)
Services: Opportunity (service offering) → Addresses (service locations) → Contacts (clients)

This flexibility creates a unified system that connects marketing, sales, and fulfillment in one platform. The collection-based approach with entity relationships provides the structure while maintaining adaptability for various business models.
The key insight is that the relationship between these entities can flow in different directions depending on the business case, but the underlying data model supports all these scenarios

