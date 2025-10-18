# SYSMAP Format Specification v1.0

## Overview

The `.sysmap` format is a human-readable, declarative language for defining business system maps. It describes entities (businesses, products, services, customers, components) and their relationships in a structured way.

## File Structure

A `.sysmap` file is organized into four main sections, each prefixed with `@`:

```
@config
@entities
@relationships
@notes
```

### Section Order Rules
- Sections MUST appear in this order: `@config`, `@entities`, `@relationships`, `@notes`
- All sections are OPTIONAL except `@entities`
- Each section can only appear ONCE in a file
- Sections are case-sensitive

---

## 1. @config Section

The `@config` section defines file-level metadata and settings.

### Syntax
```
@config
key: value
key: value
```

### Allowed Keys
- `name` (string) - Name of the system map
- `version` (string) - Version identifier
- `author` (string) - Author name
- `created` (string) - Creation date (ISO 8601 format recommended)
- `description` (string) - Brief description of the map

### Example
```
@config
name: "E-Commerce Platform Architecture"
version: "1.0"
author: "System Architect"
created: "2025-10-18"
description: "High-level view of our e-commerce ecosystem"
```

---

## 2. @entities Section

The `@entities` section defines all entities in the system map. Each entity has a type and properties.

### Syntax
```
@entities

[entity_type] entity_id {
  property: value
  property: value
}
```

### Entity ID Rules
- MUST be unique within the file
- Can contain letters, numbers, underscores, and hyphens
- MUST start with a letter
- Case-sensitive
- Example valid IDs: `acme_corp`, `Product1`, `customer-segment-A`

### Entity Types

#### 1. business
Represents a business entity or organization.

**Required Properties:**
- `label` (string) - Display name

**Optional Properties:**
- `industry` (string) - Industry sector
- `location` (string) - Geographic location
- `revenue` (number) - Annual revenue in USD
- `employees` (number) - Number of employees
- `founded` (string) - Year founded
- `status` (string) - Status (e.g., "active", "acquired", "defunct")

**Example:**
```
[business] acme_corp {
  label: "Acme Corporation"
  industry: "Technology"
  location: "San Francisco, CA"
  revenue: 5000000
  employees: 150
  founded: "2015"
  status: "active"
}
```

#### 2. product
Represents a product offering.

**Required Properties:**
- `label` (string) - Product name

**Optional Properties:**
- `category` (string) - Product category
- `price` (number) - Price in USD
- `release_date` (string) - Release date
- `version` (string) - Version number
- `status` (string) - Status (e.g., "available", "beta", "deprecated")
- `sku` (string) - Stock keeping unit

**Example:**
```
[product] widget_pro {
  label: "Widget Pro"
  category: "Software"
  price: 99.99
  release_date: "2024-01-15"
  version: "2.1"
  status: "available"
}
```

#### 3. service
Represents a service offering.

**Required Properties:**
- `label` (string) - Service name

**Optional Properties:**
- `type` (string) - Service type (e.g., "SaaS", "consulting", "support")
- `subscription` (boolean) - Whether it's subscription-based
- `monthly_fee` (number) - Monthly cost in USD
- `sla` (string) - Service level agreement description
- `status` (string) - Status (e.g., "active", "beta", "deprecated")

**Example:**
```
[service] premium_support {
  label: "Premium Support"
  type: "support"
  subscription: true
  monthly_fee: 299
  sla: "24/7 response within 1 hour"
  status: "active"
}
```

#### 4. customer
Represents a customer or customer segment.

**Required Properties:**
- `label` (string) - Customer name or segment name

**Optional Properties:**
- `type` (string) - Customer type (e.g., "B2B", "B2C", "enterprise", "SMB")
- `location` (string) - Geographic location
- `segment` (string) - Market segment
- `ltv` (number) - Lifetime value in USD
- `acquisition_date` (string) - Date acquired as customer

**Example:**
```
[customer] enterprise_segment {
  label: "Enterprise Customers"
  type: "B2B"
  segment: "Fortune 500"
  ltv: 500000
}
```

#### 5. component
Represents a technical component, system, or infrastructure element.

**Required Properties:**
- `label` (string) - Component name

**Optional Properties:**
- `type` (string) - Component type (e.g., "database", "api", "microservice", "infrastructure")
- `technology` (string) - Technology stack
- `version` (string) - Version number
- `status` (string) - Status (e.g., "production", "staging", "deprecated")
- `owner` (string) - Team or person responsible

**Example:**
```
[component] user_api {
  label: "User Management API"
  type: "microservice"
  technology: "Node.js, Express"
  version: "3.2.1"
  status: "production"
  owner: "Backend Team"
}
```

---

## 3. @relationships Section

The `@relationships` section defines directed connections between entities.

### Syntax
```
@relationships

entity_id_1 --relationship_type--> entity_id_2 {
  property: value
}

entity_id_3 --relationship_type--> entity_id_4
```

### Relationship Rules
- Both entity IDs MUST exist in the `@entities` section
- Relationships are directional (from left to right)
- Properties are OPTIONAL
- Multiple relationships between the same entities are allowed

### Arrow Types and Their Meanings

| Arrow Syntax | Meaning | Typical Use Case |
|--------------|---------|------------------|
| `--produces-->` | Entity produces/creates another | Business produces Product |
| `--supplies-->` | Entity supplies to another | Business supplies to Customer |
| `--consumes-->` | Entity consumes/uses another | Customer consumes Product |
| `--uses-->` | Entity uses another | Business uses Service |
| `--depends_on-->` | Entity depends on another | Component depends on Component |
| `--owns-->` | Entity owns another | Business owns Product |
| `--competes_with-->` | Entities are competitors | Business competes with Business |
| `--partners_with-->` | Entities are partners | Business partners with Business |
| `--supports-->` | Entity supports another | Service supports Product |
| `--integrates_with-->` | Entities integrate with each other | Component integrates with Component |
| `--subscribes_to-->` | Entity subscribes to another | Customer subscribes to Service |
| `--manages-->` | Entity manages another | Business manages Component |
| `--provides-->` | Entity provides to another | Business provides Service |
| `--calls-->` | Entity calls/invokes another | Component calls Component |
| `--contains-->` | Entity contains another | Business contains Component |

### Relationship Properties

**Optional Properties (applicable to any relationship):**
- `label` (string) - Custom label for the relationship
- `since` (string) - When the relationship started
- `strength` (string) - Relationship strength (e.g., "strong", "medium", "weak")
- `status` (string) - Status (e.g., "active", "inactive", "pending")
- `volume` (number) - Transaction volume or frequency
- `value` (number) - Monetary value of the relationship

### Example
```
@relationships

acme_corp --produces--> widget_pro {
  label: "Primary Product"
  since: "2024-01"
  status: "active"
}

enterprise_segment --subscribes_to--> premium_support {
  since: "2023-06"
  value: 50000
}

widget_pro --depends_on--> user_api
```

---

## 4. @notes Section

The `@notes` section allows free-form notes and documentation.

### Syntax
```
@notes

Any free-form text content here.
Multiple lines are allowed.
```

### Example
```
@notes

This map represents our core e-commerce platform as of Q4 2025.
Key considerations:
- The user_api is scheduled for a major refactor in Q1 2026
- Enterprise segment accounts for 70% of revenue
- Widget Pro has a 95% customer satisfaction rating
```

---

## Comments

Comments can appear ANYWHERE in the file and are ignored by parsers.

### Syntax
```
# This is a single-line comment

@entities
# Comment within a section
[business] acme {  # Inline comment
  label: "Acme Corp"  # Another inline comment
}
```

### Rules
- Comments start with `#` and continue to the end of the line
- Comments can be on their own line or at the end of a line
- Comments are ignored by parsers

---

## Value Formats

### String
- Enclosed in double quotes: `"value"`
- Can contain any characters except unescaped quotes
- Escape quotes with backslash: `"He said \"hello\""`
- Multi-line strings NOT supported (keep strings on one line)

### Number
- Integer: `42`, `1000`, `-5`
- Decimal: `99.99`, `3.14159`, `-0.5`
- No quotes
- No commas for thousands separators

### Boolean
- `true` or `false`
- No quotes
- Case-sensitive (lowercase only)

---

## Complete Examples

### Example 1: Simple Map
```
# Simple coffee shop system map

@config
name: "Local Coffee Shop"
version: "1.0"

@entities

[business] joes_coffee {
  label: "Joe's Coffee Shop"
  industry: "Food & Beverage"
  location: "Portland, OR"
}

[product] espresso {
  label: "Espresso"
  category: "Beverage"
  price: 3.50
}

[customer] regulars {
  label: "Regular Customers"
  type: "B2C"
  segment: "Local residents"
}

@relationships

joes_coffee --produces--> espresso
regulars --consumes--> espresso {
  label: "Daily purchase"
  volume: 50
}

@notes

Simple map showing the core business model of a local coffee shop.
```

---

### Example 2: Medium Complexity Map
```
# SaaS platform ecosystem

@config
name: "ProjectHub SaaS Platform"
version: "2.0"
author: "Architecture Team"
created: "2025-10-18"
description: "Project management platform with integrations"

@entities

[business] projecthub {
  label: "ProjectHub Inc"
  industry: "SaaS"
  location: "Austin, TX"
  revenue: 2500000
  employees: 45
  founded: "2020"
}

[product] project_app {
  label: "ProjectHub Application"
  category: "Project Management"
  price: 0
  status: "available"
  version: "2.3"
}

[service] basic_plan {
  label: "Basic Plan"
  type: "SaaS"
  subscription: true
  monthly_fee: 29
  status: "active"
}

[service] pro_plan {
  label: "Pro Plan"
  type: "SaaS"
  subscription: true
  monthly_fee: 99
  status: "active"
}

[customer] small_teams {
  label: "Small Teams"
  type: "B2B"
  segment: "5-20 employees"
  ltv: 3000
}

[customer] enterprises {
  label: "Enterprise Clients"
  type: "B2B"
  segment: "500+ employees"
  ltv: 50000
}

[component] api_gateway {
  label: "API Gateway"
  type: "infrastructure"
  technology: "AWS API Gateway"
  status: "production"
  owner: "Platform Team"
}

[component] database {
  label: "PostgreSQL Database"
  type: "database"
  technology: "PostgreSQL 15"
  status: "production"
  owner: "Data Team"
}

@relationships

projecthub --produces--> project_app {
  since: "2020-03"
}

projecthub --provides--> basic_plan
projecthub --provides--> pro_plan

small_teams --subscribes_to--> basic_plan {
  since: "2021-01"
  volume: 150
}

enterprises --subscribes_to--> pro_plan {
  since: "2020-06"
  volume: 25
}

project_app --depends_on--> api_gateway {
  status: "active"
  strength: "strong"
}

api_gateway --calls--> database {
  strength: "strong"
}

@notes

ProjectHub has shown 200% YoY growth.
The Pro Plan accounts for 75% of total revenue despite having fewer subscribers.
Database performance is being monitored closely as we approach 1M records.
```

---

### Example 3: Complex Map
```
# Full e-commerce platform architecture

@config
name: "E-Commerce Platform - Full Stack"
version: "3.2"
author: "Enterprise Architecture Team"
created: "2025-10-18"
description: "Complete view of our e-commerce platform including competitors, partners, and full tech stack"

@entities

# Core business
[business] our_company {
  label: "TechMart Inc"
  industry: "E-Commerce"
  location: "Seattle, WA"
  revenue: 50000000
  employees: 250
  founded: "2018"
  status: "active"
}

# Competitors
[business] competitor_a {
  label: "MegaShop Corp"
  industry: "E-Commerce"
  location: "New York, NY"
  revenue: 100000000
  status: "active"
}

[business] competitor_b {
  label: "QuickBuy Ltd"
  industry: "E-Commerce"
  location: "London, UK"
  revenue: 30000000
  status: "active"
}

# Partner
[business] logistics_partner {
  label: "FastShip Logistics"
  industry: "Logistics"
  location: "Dallas, TX"
  revenue: 25000000
  status: "active"
}

# Products
[product] marketplace_platform {
  label: "TechMart Marketplace"
  category: "E-Commerce Platform"
  status: "available"
  version: "3.2"
}

[product] mobile_app {
  label: "TechMart Mobile App"
  category: "Mobile Application"
  status: "available"
  version: "2.8"
}

[product] seller_dashboard {
  label: "Seller Dashboard"
  category: "Web Application"
  status: "available"
  version: "1.5"
}

# Services
[service] premium_membership {
  label: "TechMart Premium"
  type: "SaaS"
  subscription: true
  monthly_fee: 14.99
  status: "active"
  sla: "Free shipping, 24/7 support"
}

[service] seller_subscription {
  label: "Seller Pro Subscription"
  type: "SaaS"
  subscription: true
  monthly_fee: 199
  status: "active"
}

[service] payment_processing {
  label: "Payment Processing Service"
  type: "fintech"
  subscription: false
  status: "active"
}

# Customers
[customer] retail_buyers {
  label: "Retail Customers"
  type: "B2C"
  segment: "General consumers"
  ltv: 850
}

[customer] premium_members {
  label: "Premium Members"
  type: "B2C"
  segment: "Subscription members"
  ltv: 2400
}

[customer] third_party_sellers {
  label: "Third-Party Sellers"
  type: "B2B"
  segment: "SMB retailers"
  ltv: 25000
}

# Frontend components
[component] web_frontend {
  label: "Web Frontend"
  type: "frontend"
  technology: "React 18, Vite"
  version: "3.2.1"
  status: "production"
  owner: "Frontend Team"
}

[component] mobile_frontend {
  label: "Mobile Frontend"
  type: "mobile"
  technology: "React Native"
  version: "2.8.0"
  status: "production"
  owner: "Mobile Team"
}

# Backend components
[component] api_gateway {
  label: "API Gateway"
  type: "infrastructure"
  technology: "Kong Gateway"
  version: "3.0"
  status: "production"
  owner: "Platform Team"
}

[component] product_service {
  label: "Product Catalog Service"
  type: "microservice"
  technology: "Node.js, Express"
  version: "2.1.5"
  status: "production"
  owner: "Backend Team"
}

[component] order_service {
  label: "Order Management Service"
  type: "microservice"
  technology: "Java, Spring Boot"
  version: "4.3.0"
  status: "production"
  owner: "Backend Team"
}

[component] user_service {
  label: "User Service"
  type: "microservice"
  technology: "Python, FastAPI"
  version: "1.8.2"
  status: "production"
  owner: "Backend Team"
}

[component] payment_service {
  label: "Payment Service"
  type: "microservice"
  technology: "Java, Spring Boot"
  version: "3.0.1"
  status: "production"
  owner: "Payments Team"
}

[component] search_engine {
  label: "Search Engine"
  type: "infrastructure"
  technology: "Elasticsearch"
  version: "8.5"
  status: "production"
  owner: "Data Team"
}

# Data layer
[component] primary_database {
  label: "Primary PostgreSQL Database"
  type: "database"
  technology: "PostgreSQL 15"
  version: "15.2"
  status: "production"
  owner: "Data Team"
}

[component] cache_layer {
  label: "Redis Cache"
  type: "cache"
  technology: "Redis"
  version: "7.0"
  status: "production"
  owner: "Platform Team"
}

[component] analytics_db {
  label: "Analytics Data Warehouse"
  type: "database"
  technology: "Snowflake"
  version: "7.2"
  status: "production"
  owner: "Analytics Team"
}

# External services
[component] stripe_integration {
  label: "Stripe Payment Gateway"
  type: "external_api"
  technology: "Stripe API"
  status: "production"
  owner: "Payments Team"
}

[component] email_service {
  label: "SendGrid Email Service"
  type: "external_api"
  technology: "SendGrid API"
  status: "production"
  owner: "Platform Team"
}

@relationships

# Business relationships
our_company --produces--> marketplace_platform {
  since: "2018-06"
  status: "active"
}

our_company --produces--> mobile_app {
  since: "2019-03"
  status: "active"
}

our_company --produces--> seller_dashboard {
  since: "2020-01"
  status: "active"
}

our_company --provides--> premium_membership {
  since: "2019-11"
  status: "active"
}

our_company --provides--> seller_subscription {
  since: "2020-01"
  status: "active"
}

our_company --provides--> payment_processing

our_company --partners_with--> logistics_partner {
  since: "2018-08"
  strength: "strong"
  value: 5000000
}

our_company --competes_with--> competitor_a {
  strength: "strong"
}

our_company --competes_with--> competitor_b {
  strength: "medium"
}

# Customer relationships
retail_buyers --consumes--> marketplace_platform {
  volume: 50000
  status: "active"
}

premium_members --subscribes_to--> premium_membership {
  volume: 15000
  since: "2019-11"
}

premium_members --consumes--> marketplace_platform {
  volume: 15000
}

third_party_sellers --uses--> seller_dashboard {
  volume: 3500
}

third_party_sellers --subscribes_to--> seller_subscription {
  volume: 2800
}

# Product to component relationships
marketplace_platform --depends_on--> web_frontend
mobile_app --depends_on--> mobile_frontend
seller_dashboard --depends_on--> web_frontend

# Frontend to API Gateway
web_frontend --calls--> api_gateway {
  strength: "strong"
}

mobile_frontend --calls--> api_gateway {
  strength: "strong"
}

# API Gateway to microservices
api_gateway --calls--> product_service {
  strength: "strong"
}

api_gateway --calls--> order_service {
  strength: "strong"
}

api_gateway --calls--> user_service {
  strength: "strong"
}

api_gateway --calls--> payment_service {
  strength: "strong"
}

# Microservices to data layer
product_service --depends_on--> primary_database {
  strength: "strong"
}

order_service --depends_on--> primary_database {
  strength: "strong"
}

user_service --depends_on--> primary_database {
  strength: "strong"
}

payment_service --depends_on--> primary_database {
  strength: "strong"
}

# Cache relationships
product_service --uses--> cache_layer {
  strength: "medium"
}

user_service --uses--> cache_layer {
  strength: "strong"
}

# Search integration
product_service --integrates_with--> search_engine {
  strength: "strong"
}

# External service integrations
payment_service --integrates_with--> stripe_integration {
  strength: "strong"
  status: "active"
}

order_service --calls--> email_service {
  strength: "medium"
}

user_service --calls--> email_service {
  strength: "medium"
}

# Analytics
order_service --provides--> analytics_db {
  label: "Order data pipeline"
}

product_service --provides--> analytics_db {
  label: "Product data pipeline"
}

user_service --provides--> analytics_db {
  label: "User data pipeline"
}

@notes

## System Overview
This map represents the complete TechMart e-commerce platform as of Q4 2025.

## Key Metrics
- 50,000 daily active retail buyers
- 15,000 premium members (30% conversion rate goal)
- 3,500 active third-party sellers
- 99.9% uptime SLA for all production services

## Architecture Notes
- Microservices architecture adopted in 2020
- PostgreSQL is primary transactional database
- Redis cache reduces database load by ~40%
- Elasticsearch powers product search with sub-100ms response times

## Business Notes
- FastShip Logistics handles 95% of our fulfillment
- Competitor MegaShop Corp is our primary competitor (2x our size)
- Premium membership launched Nov 2019, now accounts for 35% of revenue
- Third-party seller marketplace launched Jan 2020, growing 150% YoY

## Upcoming Changes
- Planning to migrate payment_service to Go for better performance (Q1 2026)
- Exploring partnership with additional logistics providers for redundancy
- Mobile app redesign scheduled for Q2 2026
- AI-powered recommendation engine in development (new component coming)
```

---

## Parsing Guidelines for LLMs

When parsing a `.sysmap` file:

1. **Section Detection**: Look for lines starting with `@` to identify sections
2. **Entity Parsing**: Match pattern `[type] id {` to start entity, `}` to end
3. **Property Parsing**: Match pattern `key: value` within entities or relationships
4. **Relationship Parsing**: Match pattern `id --arrow--> id` with optional `{` for properties
5. **Comment Removal**: Strip all content from `#` to end of line before parsing
6. **String Values**: Extract content between double quotes, handle escaped quotes
7. **Number Values**: Parse as integer or float based on decimal point presence
8. **Boolean Values**: Match exact strings `true` or `false`

### Error Handling
- Undefined entity ID in relationship → Error
- Duplicate entity ID → Error
- Invalid property for entity type → Warning (ignore property)
- Unknown entity type → Error
- Unknown relationship arrow → Warning (treat as generic relationship)
- Malformed syntax → Error with line number

---

## File Extension
- Standard extension: `.sysmap`
- MIME type: `text/plain` or `text/x-sysmap`

---

## Version History
- v1.0 (2025-10-18) - Initial specification
