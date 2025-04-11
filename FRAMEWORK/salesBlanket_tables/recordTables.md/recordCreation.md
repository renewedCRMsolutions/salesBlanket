# Records Creation Propagation

Definitions: 

- Merge, Merger, Marriage  

## addresses

*on creation:*

- streets record
- collections record if no merge

*on delete:*

- no delete, made inactive

## contacts

*on creation:*

- collections record if no merge

*on delete:*

- no delete, made inactive

## opportunities

*on creation:*

- collections record if no merge

*on delete:*

### address_contacts

*Trigger:*

Event

- address and contact merge on collection

### address_opportunities

*Trigger:*

Event

- address and opportunity merge on collection

### streets

on creation:*

*on delete:*

### collections

on creation:*

Waterfall

- 

*on delete:*

#### touchpoints

