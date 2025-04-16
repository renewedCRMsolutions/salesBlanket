# salesBlanket Forms

"ultimate B2B solution" - salesBlanket's value - a platform flexible enough to handle diverse business relationships while maintaining connections between marketing, sales, and fulfillment in one system, without the hassle.

Entity-First Approach

## Creation Form

RULES:

Creation Logic

Frontend validation to check for existing entities
Suggest matches during creation (not database-level)
User explicitly confirms relationships during creation

A user can start entry with a Contact or and Address.  

Select an entity (I want to work with an address)
Select a type (It's a residential address)
Select subtypes (It has these specific features: windows, garage, etc.)

## Acronyms

address = a
neighborhoods = n
collections = c
property condition form = pcf
contacts = con
opportunity = o

addresses, contacts, opportunities

column visibility
hidden = 1
shown = 2
expandable = 3

### Selection or Entity Entry

Please select a address or contact type

user selects a address_type.id or contact_type.id -> UI shows the display name - use the uuid for queries

"id" "display_name"
"49619359-fbb8-43f5-ba67-2adf280182ff"	"Commercial"
"6c98c361-5270-47f2-b814-57a36f9bf128"	"Residential"
"94f9c909-2ccb-404e-9052-13679da62e08"	"Investment Property"
"ba2e903f-26ca-4899-a087-689c0b7c3edd"	"Storage"
"c9157a6b-f239-4d1e-a09a-fe28a96588d0"	"Rental Property"
"ffb6db1a-5a77-4e88-ba37-ae6dfb113955"	"Vacation Home"





### Form Part B - Address

form a will gather data to create the Addresses record
H1 - "Address Entry"
Show the date on the top right - day of the work
top of form UI
toggle switch(t.s) to turn the google places auto address fill ON / OFF
t.s default = ON
form

table name addresses

addresses form_definitions.id: "832375ab-cc24-41dc-b1ed-29e471c66257"

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
toggle on header.
footer has "property condition report" button that will expand to reveal the property condition form.
footer has a submit button as well.

Property Condition form_definition.id 753635b5-12df-4220-a887-8dd6bdaece9a

form_type - addresses
category - property_condition_form


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

Form Propagation:
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

user clicks add opportunity and they are taken to the opportunity form
user clicks all done and they are 

## Form Part D - Opportunity Form

Form Header

H1 - "Opportunity Entry"
Show the date on the top right - day of the work
Show selected collection ID (hidden, for reference)

Common Fields
All opportunity forms have these base fields:

1, o.id = auto fill uuid
2, o.opportunity_type_id = dropdown "select opportunity type" options based on cached data. opportunity_types.name contains human readable text. Required
2, o.status = dropdown with options "ACTIVE" (default), "PENDING", "CLOSED", "LOST"
2, o.notes = text area, nullable, max 500 char
1, o.created_by = auto fill user.id with timestampz
1, o.created_at = auto timestampz
1, o.updated_at = auto timestampz
1, o.collection_id = auto fill from the passed collection_id value
1, o.form_version = auto fill from the current form version
1, o.metadata = auto fill with the dynamic form field values (JSON structure)

Footer Controls

"Submit" button to create the opportunity
"Cancel" button to exit without saving

Dynamic Form Fields
Based on the selected opportunity type, the form will dynamically display different field sets:
Roofing Opportunity Form
2, o.metadata.roof_type = dropdown "Roof Type"

Options: "Asphalt Shingle", "Metal", "Tile", "Flat/TPO", "Other"
Required: Yes
Order: 1

2, o.metadata.square_footage = number field "Approximate Square Footage"

Min: 0
Required: Yes
Order: 2

2, o.metadata.damage_type = multi-select "Type of Damage"

Options: "Storm", "Age", "Leaks", "Missing Shingles", "Other"
Required: Yes
Order: 3

2, o.metadata.insurance_claim = yes/no toggle "Insurance Claim"

Default: No
Required: No
Order: 4

2, o.metadata.estimated_value = currency field "Estimated Value"

Min: 0
Required: No
Order: 5

Siding Opportunity Form
2, o.metadata.current_siding = dropdown "Current Siding Type"

Options: "Vinyl", "Wood", "Fiber Cement", "Aluminum", "Stucco", "Other"
Required: Yes
Order: 1

2, o.metadata.desired_siding = dropdown "Desired Siding Type"

Options: "Vinyl", "Wood", "Fiber Cement", "Aluminum", "Stucco", "Other"
Required: No
Order: 2

2, o.metadata.damage_description = text area "Damage Description"

Max: 200 chars
Required: No
Order: 3

2, o.metadata.house_size = number field "House Size (sq ft)"

Min: 0
Required: Yes
Order: 4

2, o.metadata.estimated_value = currency field "Estimated Value"

Min: 0
Required: No
Order: 5

Solar Opportunity Form
2, o.metadata.roof_condition = dropdown "Roof Condition"

Options: "New", "Good", "Fair", "Poor", "Unknown"
Required: Yes
Order: 1

2, o.metadata.energy_bill = currency field "Average Monthly Energy Bill"

Min: 0
Required: Yes
Order: 2

2, o.metadata.roof_direction = multi-select "Roof Direction"

Options: "North", "South", "East", "West"
Required: Yes
Order: 3

2, o.metadata.shade_factor = dropdown "Shade Factor"

Options: "None", "Light", "Moderate", "Heavy"
Required: Yes
Order: 4

2, o.metadata.financing_interested = yes/no toggle "Interested in Financing"

Default: Yes
Required: No
Order: 5

2, o.metadata.estimated_value = currency field "Estimated Value"

Min: 0
Required: No
Order: 6

Form Propagation
On Submit

Validate all required fields
Format JSON data structure for metadata
Create opportunity record
Update collection record if needed
Return user to collection view
Display success message

Creation Logic
The creation of an opportunity follows these steps:

Prepare standard fields (opportunity_type_id, status, notes, etc.)
Prepare metadata JSON with all dynamic form fields
Set collection_id from the current context
Insert record into opportunities table
Update collection record to include new opportunity (if needed)

Implementation Scenarios
Scenario 1: From Address Workflow
When user creates an address and then selects "Add New Opportunity":

Address record is created
Collection record is created or updated
User is navigated to Opportunity form
Form is pre-populated with collection_id
On submit, the opportunity is associated with the same collection as the address

Scenario 2: From Contact Workflow
When user creates a contact and selects "Add Opportunity":

Contact record is created
Collection record is created or updated
User is navigated to Opportunity form
Form is pre-populated with collection_id
On submit, the opportunity is associated with the same collection as the contact

Scenario 3: Direct Addition
When user selects "Add New Opportunity" from an existing collection:

Opportunity form is displayed
Form is pre-populated with existing collection_id
On submit, opportunity is associated with the existing collection

UI Behavior

Opportunity type dropdown is at top of form
When opportunity type is selected, the form dynamically updates to show the relevant fields
Form fields are displayed in the specified order
Required fields are indicated with an asterisk (*)
Validation errors are displayed inline
Success/failure messages display after submission

Opportunity Form:


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

This puts relationship control with users while maintaining data integrity. Collection merges should have clear warnings but provide flexibility to combine related records when needed.RetryRWi mean maybe somebody enters an opportunity before - what if i allow the application to log a item to sell as the opportunity and then the addresses are where items are sent and contacts are the interested buyers, or maybe the opportunity is a website and the contacts are the visitors and the addresses are the IP address and such.. salesBlanket covers it all..   simple, effective for that connection between marketing, the sale, and the retailer..  is that almost a mission statement... wowEditYou've just articulated a powerful mission statement for salesBlanket. The flexibility to handle different business scenarios is exactly what makes your platform valuable:

Retail: Opportunity (product) → Addresses (delivery) → Contacts (buyers)
Web Business: Opportunity (website) → Addresses (IP locations) → Contacts (visitors)
Services: Opportunity (service offering) → Addresses (service locations) → Contacts (clients)

This flexibility creates a unified system that connects marketing, sales, and fulfillment in one platform. The collection-based approach with entity relationships provides the structure while maintaining adaptability for various business models.
The key insight is that the relationship between these entities can flow in different directions depending on the business case, but the underlying data model supports all these scenarios

