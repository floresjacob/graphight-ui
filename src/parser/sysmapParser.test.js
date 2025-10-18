/**
 * Unit tests for SYSMAP Parser
 */

import { parseSysmap, getSysmapSummary } from './sysmapParser.js';

describe('SYSMAP Parser', () => {
  describe('Basic Parsing', () => {
    test('should parse minimal valid .sysmap file', () => {
      const input = `
@entities

[business] test_biz {
  label: "Test Business"
}
`;

      const result = parseSysmap(input);

      expect(result.entities.size).toBe(1);
      expect(result.entities.has('test_biz')).toBe(true);
      expect(result.entities.get('test_biz')).toEqual({
        type: 'business',
        properties: { label: 'Test Business' }
      });
      expect(result.config).toEqual({});
      expect(result.relationships).toEqual([]);
      expect(result.notes).toEqual([]);
    });

    test('should parse all sections', () => {
      const input = `
@config
name: "Test Map"
version: "1.0"

@entities

[business] biz1 {
  label: "Business 1"
}

[product] prod1 {
  label: "Product 1"
}

@relationships

biz1 --produces--> prod1

@notes

This is a test note.
Another line of notes.
`;

      const result = parseSysmap(input);

      expect(result.config).toEqual({
        name: 'Test Map',
        version: '1.0'
      });
      expect(result.entities.size).toBe(2);
      expect(result.relationships.length).toBe(1);
      expect(result.notes.length).toBe(2);
    });
  });

  describe('Comment Handling', () => {
    test('should remove single-line comments', () => {
      const input = `
# This is a comment
@entities

# Another comment
[business] test_biz {
  label: "Test Business"  # Inline comment
}
`;

      const result = parseSysmap(input);

      expect(result.entities.size).toBe(1);
      expect(result.entities.get('test_biz').properties.label).toBe('Test Business');
    });

    test('should handle comments in all sections', () => {
      const input = `
# Config section comment
@config
name: "Test"  # Config comment

# Entities section comment
@entities

[business] biz1 {  # Entity comment
  label: "Business"  # Property comment
}

# Relationships section comment
@relationships

biz1 --produces--> biz1  # Relationship comment

# Notes section comment
@notes

Note text  # Note comment
`;

      const result = parseSysmap(input);

      expect(result.config.name).toBe('Test');
      expect(result.entities.size).toBe(1);
      expect(result.relationships.length).toBe(1);
      expect(result.notes.length).toBe(1);
    });
  });

  describe('Value Type Parsing', () => {
    test('should parse string values', () => {
      const input = `
@entities

[business] biz1 {
  label: "Test Business"
  location: "San Francisco, CA"
}
`;

      const result = parseSysmap(input);
      const entity = result.entities.get('biz1');

      expect(entity.properties.label).toBe('Test Business');
      expect(entity.properties.location).toBe('San Francisco, CA');
    });

    test('should parse number values', () => {
      const input = `
@entities

[business] biz1 {
  label: "Test"
  revenue: 1000000
  employees: 50
}

[product] prod1 {
  label: "Product"
  price: 99.99
}
`;

      const result = parseSysmap(input);

      expect(result.entities.get('biz1').properties.revenue).toBe(1000000);
      expect(result.entities.get('biz1').properties.employees).toBe(50);
      expect(result.entities.get('prod1').properties.price).toBe(99.99);
    });

    test('should parse boolean values', () => {
      const input = `
@entities

[service] svc1 {
  label: "Service"
  subscription: true
}

[service] svc2 {
  label: "Service 2"
  subscription: false
}
`;

      const result = parseSysmap(input);

      expect(result.entities.get('svc1').properties.subscription).toBe(true);
      expect(result.entities.get('svc2').properties.subscription).toBe(false);
    });

    test('should handle escaped quotes in strings', () => {
      const input = `
@entities

[business] biz1 {
  label: "He said \\"hello\\""
}
`;

      const result = parseSysmap(input);

      expect(result.entities.get('biz1').properties.label).toBe('He said "hello"');
    });

    test('should handle negative numbers', () => {
      const input = `
@entities

[business] biz1 {
  label: "Test"
  revenue: -5000
}
`;

      const result = parseSysmap(input);

      expect(result.entities.get('biz1').properties.revenue).toBe(-5000);
    });
  });

  describe('Entity Parsing', () => {
    test('should parse all entity types', () => {
      const input = `
@entities

[business] biz1 {
  label: "Business"
}

[product] prod1 {
  label: "Product"
}

[service] svc1 {
  label: "Service"
}

[customer] cust1 {
  label: "Customer"
}

[component] comp1 {
  label: "Component"
}
`;

      const result = parseSysmap(input);

      expect(result.entities.size).toBe(5);
      expect(result.entities.get('biz1').type).toBe('business');
      expect(result.entities.get('prod1').type).toBe('product');
      expect(result.entities.get('svc1').type).toBe('service');
      expect(result.entities.get('cust1').type).toBe('customer');
      expect(result.entities.get('comp1').type).toBe('component');
    });

    test('should parse entity with all properties', () => {
      const input = `
@entities

[business] biz1 {
  label: "Acme Corp"
  industry: "Technology"
  location: "San Francisco"
  revenue: 5000000
  employees: 100
  founded: "2020"
  status: "active"
}
`;

      const result = parseSysmap(input);
      const entity = result.entities.get('biz1');

      expect(entity.properties).toEqual({
        label: 'Acme Corp',
        industry: 'Technology',
        location: 'San Francisco',
        revenue: 5000000,
        employees: 100,
        founded: '2020',
        status: 'active'
      });
    });

    test('should accept valid entity IDs', () => {
      const input = `
@entities

[business] valid_id_123 {
  label: "Test"
}

[business] ValidID {
  label: "Test 2"
}

[business] test-id-456 {
  label: "Test 3"
}
`;

      const result = parseSysmap(input);

      expect(result.entities.size).toBe(3);
      expect(result.entities.has('valid_id_123')).toBe(true);
      expect(result.entities.has('ValidID')).toBe(true);
      expect(result.entities.has('test-id-456')).toBe(true);
    });
  });

  describe('Relationship Parsing', () => {
    test('should parse simple relationships', () => {
      const input = `
@entities

[business] biz1 {
  label: "Business"
}

[product] prod1 {
  label: "Product"
}

@relationships

biz1 --produces--> prod1
`;

      const result = parseSysmap(input);

      expect(result.relationships.length).toBe(1);
      expect(result.relationships[0]).toEqual({
        source: 'biz1',
        target: 'prod1',
        type: 'produces',
        properties: {}
      });
    });

    test('should parse relationships with properties', () => {
      const input = `
@entities

[business] biz1 {
  label: "Business"
}

[customer] cust1 {
  label: "Customer"
}

@relationships

biz1 --supplies--> cust1 {
  label: "Primary supplier"
  since: "2023-01"
  strength: "strong"
  volume: 1000
}
`;

      const result = parseSysmap(input);

      expect(result.relationships.length).toBe(1);
      expect(result.relationships[0]).toEqual({
        source: 'biz1',
        target: 'cust1',
        type: 'supplies',
        properties: {
          label: 'Primary supplier',
          since: '2023-01',
          strength: 'strong',
          volume: 1000
        }
      });
    });

    test('should parse multiple relationships', () => {
      const input = `
@entities

[business] biz1 {
  label: "Business"
}

[product] prod1 {
  label: "Product"
}

[customer] cust1 {
  label: "Customer"
}

@relationships

biz1 --produces--> prod1
biz1 --supplies--> cust1
cust1 --consumes--> prod1
`;

      const result = parseSysmap(input);

      expect(result.relationships.length).toBe(3);
      expect(result.relationships[0].type).toBe('produces');
      expect(result.relationships[1].type).toBe('supplies');
      expect(result.relationships[2].type).toBe('consumes');
    });

    test('should parse all relationship arrow types', () => {
      const input = `
@entities

[business] biz1 {
  label: "Business"
}

@relationships

biz1 --produces--> biz1
biz1 --supplies--> biz1
biz1 --consumes--> biz1
biz1 --uses--> biz1
biz1 --depends_on--> biz1
biz1 --owns--> biz1
biz1 --competes_with--> biz1
biz1 --partners_with--> biz1
biz1 --supports--> biz1
biz1 --integrates_with--> biz1
biz1 --subscribes_to--> biz1
biz1 --manages--> biz1
biz1 --provides--> biz1
biz1 --calls--> biz1
biz1 --contains--> biz1
`;

      const result = parseSysmap(input);

      expect(result.relationships.length).toBe(15);
      expect(result.relationships.map(r => r.type)).toEqual([
        'produces', 'supplies', 'consumes', 'uses', 'depends_on', 'owns',
        'competes_with', 'partners_with', 'supports', 'integrates_with',
        'subscribes_to', 'manages', 'provides', 'calls', 'contains'
      ]);
    });
  });

  describe('Section Order Validation', () => {
    test('should enforce section order', () => {
      const input = `
@relationships

@entities

[business] biz1 {
  label: "Business"
}
`;

      expect(() => parseSysmap(input)).toThrow(/Sections must appear in order/);
    });

    test('should allow sections to be omitted', () => {
      const input = `
@entities

[business] biz1 {
  label: "Business"
}
`;

      const result = parseSysmap(input);

      expect(result.entities.size).toBe(1);
      expect(result.config).toEqual({});
      expect(result.relationships).toEqual([]);
      expect(result.notes).toEqual([]);
    });

    test('should reject duplicate sections', () => {
      const input = `
@config
name: "Test"

@config
name: "Test 2"

@entities

[business] biz1 {
  label: "Business"
}
`;

      expect(() => parseSysmap(input)).toThrow(/Duplicate section/);
    });
  });

  describe('Error Handling', () => {
    test('should throw error if @entities section is missing', () => {
      const input = `
@config
name: "Test"
`;

      expect(() => parseSysmap(input)).toThrow(/@entities section is required/);
    });

    test('should throw error for invalid entity type', () => {
      const input = `
@entities

[invalid_type] biz1 {
  label: "Business"
}
`;

      expect(() => parseSysmap(input)).toThrow(/Unknown entity type/);
    });

    test('should throw error for invalid entity ID', () => {
      const input = `
@entities

[business] 123invalid {
  label: "Business"
}
`;

      expect(() => parseSysmap(input)).toThrow(/Invalid entity ID/);
    });

    test('should throw error for duplicate entity ID', () => {
      const input = `
@entities

[business] biz1 {
  label: "Business 1"
}

[product] biz1 {
  label: "Product 1"
}
`;

      expect(() => parseSysmap(input)).toThrow(/Duplicate entity ID/);
    });

    test('should throw error for missing label property', () => {
      const input = `
@entities

[business] biz1 {
  industry: "Tech"
}
`;

      expect(() => parseSysmap(input)).toThrow(/missing required property 'label'/);
    });

    test('should throw error for undefined entity in relationship', () => {
      const input = `
@entities

[business] biz1 {
  label: "Business"
}

@relationships

biz1 --produces--> undefined_entity
`;

      expect(() => parseSysmap(input)).toThrow(/Undefined entity ID/);
    });

    test('should throw error for invalid property format', () => {
      const input = `
@entities

[business] biz1 {
  label "Missing Colon"
}
`;

      expect(() => parseSysmap(input)).toThrow(/Property must be in format/);
    });

    test('should throw error for invalid string value', () => {
      const input = `
@entities

[business] biz1 {
  label: Missing Quotes
}
`;

      expect(() => parseSysmap(input)).toThrow(/Invalid value format/);
    });

    test('should throw error for invalid boolean value', () => {
      const input = `
@entities

[service] svc1 {
  label: "Service"
  subscription: yes
}
`;

      expect(() => parseSysmap(input)).toThrow(/Invalid value format/);
    });

    test('should throw error for invalid number value', () => {
      const input = `
@entities

[business] biz1 {
  label: "Business"
  revenue: 1,000,000
}
`;

      expect(() => parseSysmap(input)).toThrow(/Invalid value format/);
    });

    test('should throw error for unexpected content outside sections', () => {
      const input = `
This is unexpected content

@entities

[business] biz1 {
  label: "Business"
}
`;

      expect(() => parseSysmap(input)).toThrow(/Unexpected content outside of sections/);
    });

    test('should throw error for unknown section', () => {
      const input = `
@unknown_section

@entities

[business] biz1 {
  label: "Business"
}
`;

      expect(() => parseSysmap(input)).toThrow(/Unknown section/);
    });

    test('should throw error for invalid relationship format', () => {
      const input = `
@entities

[business] biz1 {
  label: "Business"
}

@relationships

biz1 -> biz1
`;

      expect(() => parseSysmap(input)).toThrow(/Invalid relationship declaration/);
    });

    test('should throw error for non-string input', () => {
      expect(() => parseSysmap(null)).toThrow(/Input must be a string/);
      expect(() => parseSysmap(undefined)).toThrow(/Input must be a string/);
      expect(() => parseSysmap(123)).toThrow(/Input must be a string/);
    });
  });

  describe('Real-World Examples', () => {
    test('should parse apple.sysmap example', () => {
      const input = `
# Apple Inc. System Map

@config
name: "Apple Inc. Business Map"
version: "1.0"
created: "2025-10-18"
description: "Apple's core business entities and relationships"

@entities

[business] apple_inc {
  label: "Apple Inc."
  industry: "Technology"
  location: "Cupertino, CA"
  revenue: 365800000000
}

[product] iphone {
  label: "iPhone"
  category: "Smartphone"
  price: 999
  release_date: "2023-09"
}

[service] icloud {
  label: "iCloud"
  type: "Cloud Storage"
  subscription: true
  monthly_fee: 9.99
}

[customer] enterprise_corp {
  label: "Enterprise Corp"
  type: "B2B"
  location: "New York, NY"
}

@relationships

apple_inc --produces--> iphone

apple_inc --provides--> icloud

iphone --supplies--> enterprise_corp

icloud --supplies--> enterprise_corp

@notes

This map represents Apple Inc.'s core business structure including their flagship iPhone product,
iCloud service, and their enterprise customer segment.
`;

      const result = parseSysmap(input);

      expect(result.config.name).toBe('Apple Inc. Business Map');
      expect(result.entities.size).toBe(4);
      expect(result.relationships.length).toBe(4);
      expect(result.notes.length).toBeGreaterThan(0);

      // Validate specific entities
      expect(result.entities.get('apple_inc').type).toBe('business');
      expect(result.entities.get('apple_inc').properties.revenue).toBe(365800000000);
      expect(result.entities.get('iphone').type).toBe('product');
      expect(result.entities.get('icloud').properties.subscription).toBe(true);

      // Validate relationships
      expect(result.relationships[0]).toEqual({
        source: 'apple_inc',
        target: 'iphone',
        type: 'produces',
        properties: {}
      });
    });
  });

  describe('getSysmapSummary', () => {
    test('should return summary for valid sysmap', () => {
      const input = `
@config
name: "Test"

@entities

[business] biz1 {
  label: "Business"
}

[product] prod1 {
  label: "Product"
}

[product] prod2 {
  label: "Product 2"
}

@relationships

biz1 --produces--> prod1
biz1 --produces--> prod2

@notes

Test notes
`;

      const summary = getSysmapSummary(input);

      expect(summary.success).toBe(true);
      expect(summary.entityCount).toBe(3);
      expect(summary.relationshipCount).toBe(2);
      expect(summary.hasConfig).toBe(true);
      expect(summary.hasNotes).toBe(true);
      expect(summary.entityTypes).toEqual({
        business: 1,
        product: 2
      });
    });

    test('should return error for invalid sysmap', () => {
      const input = `
@entities

[invalid_type] biz1 {
  label: "Business"
}
`;

      const summary = getSysmapSummary(input);

      expect(summary.success).toBe(false);
      expect(summary.error).toBeDefined();
      expect(summary.error).toContain('Unknown entity type');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty file with only @entities section', () => {
      const input = `
@entities
`;

      const result = parseSysmap(input);

      expect(result.entities.size).toBe(0);
    });

    test('should handle whitespace variations', () => {
      const input = `
@entities

[business]    biz1    {
  label:    "Business"
  revenue:   1000000
}
`;

      const result = parseSysmap(input);

      expect(result.entities.size).toBe(1);
      expect(result.entities.get('biz1').properties.label).toBe('Business');
      expect(result.entities.get('biz1').properties.revenue).toBe(1000000);
    });

    test('should handle empty lines in entities', () => {
      const input = `
@entities

[business] biz1 {

  label: "Business"

  revenue: 1000000

}
`;

      const result = parseSysmap(input);

      expect(result.entities.size).toBe(1);
      expect(result.entities.get('biz1').properties).toEqual({
        label: 'Business',
        revenue: 1000000
      });
    });

    test('should handle relationships to same entity', () => {
      const input = `
@entities

[business] biz1 {
  label: "Business"
}

@relationships

biz1 --competes_with--> biz1
`;

      const result = parseSysmap(input);

      expect(result.relationships.length).toBe(1);
      expect(result.relationships[0]).toEqual({
        source: 'biz1',
        target: 'biz1',
        type: 'competes_with',
        properties: {}
      });
    });
  });
});
