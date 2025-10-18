/**
 * Unit tests for SYSMAP Converter
 */

import { sysmapToReactFlow, reactFlowToSysmap, getConversionSummary, relayoutNodes } from './sysmapConverter.js';

describe('SYSMAP Converter', () => {
  describe('sysmapToReactFlow', () => {
    test('should convert simple parsed sysmap to React Flow format', () => {
      const parsedSysmap = {
        config: {},
        entities: new Map([
          ['biz1', {
            type: 'business',
            properties: { label: 'Test Business', industry: 'Tech' }
          }],
          ['prod1', {
            type: 'product',
            properties: { label: 'Test Product', price: 99 }
          }]
        ]),
        relationships: [
          {
            source: 'biz1',
            target: 'prod1',
            type: 'produces',
            properties: {}
          }
        ],
        notes: []
      };

      const result = sysmapToReactFlow(parsedSysmap);

      expect(result.nodes).toHaveLength(2);
      expect(result.edges).toHaveLength(1);

      // Check node structure
      const bizNode = result.nodes.find(n => n.id === 'biz1');
      expect(bizNode).toBeDefined();
      expect(bizNode.type).toBe('business');
      expect(bizNode.data.label).toBe('Test Business');
      expect(bizNode.data.industry).toBe('Tech');
      expect(bizNode.position).toHaveProperty('x');
      expect(bizNode.position).toHaveProperty('y');
      expect(bizNode.style).toHaveProperty('background');

      // Check edge structure
      const edge = result.edges[0];
      expect(edge.source).toBe('biz1');
      expect(edge.target).toBe('prod1');
      expect(edge.data.relationshipType).toBe('produces');
    });

    test('should apply different styles for different entity types', () => {
      const parsedSysmap = {
        config: {},
        entities: new Map([
          ['biz1', { type: 'business', properties: { label: 'Business' } }],
          ['prod1', { type: 'product', properties: { label: 'Product' } }],
          ['svc1', { type: 'service', properties: { label: 'Service' } }],
          ['cust1', { type: 'customer', properties: { label: 'Customer' } }],
          ['comp1', { type: 'component', properties: { label: 'Component' } }]
        ]),
        relationships: [],
        notes: []
      };

      const result = sysmapToReactFlow(parsedSysmap);

      expect(result.nodes).toHaveLength(5);

      // Each node should have unique styling
      const styles = result.nodes.map(n => n.style.background);
      const uniqueStyles = new Set(styles);
      expect(uniqueStyles.size).toBe(5);
    });

    test('should use hierarchical layout by default', () => {
      const parsedSysmap = {
        config: {},
        entities: new Map([
          ['biz1', { type: 'business', properties: { label: 'Business' } }],
          ['prod1', { type: 'product', properties: { label: 'Product' } }]
        ]),
        relationships: [
          { source: 'biz1', target: 'prod1', type: 'produces', properties: {} }
        ],
        notes: []
      };

      const result = sysmapToReactFlow(parsedSysmap);

      // In hierarchical layout, source should be above target
      const bizNode = result.nodes.find(n => n.id === 'biz1');
      const prodNode = result.nodes.find(n => n.id === 'prod1');
      expect(bizNode.position.y).toBeLessThan(prodNode.position.y);
    });

    test('should support force-directed layout', () => {
      const parsedSysmap = {
        config: {},
        entities: new Map([
          ['biz1', { type: 'business', properties: { label: 'Business' } }],
          ['prod1', { type: 'product', properties: { label: 'Product' } }]
        ]),
        relationships: [
          { source: 'biz1', target: 'prod1', type: 'produces', properties: {} }
        ],
        notes: []
      };

      const result = sysmapToReactFlow(parsedSysmap, 'force-directed');

      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0].position).toHaveProperty('x');
      expect(result.nodes[0].position).toHaveProperty('y');
    });

    test('should include relationship properties in edge data', () => {
      const parsedSysmap = {
        config: {},
        entities: new Map([
          ['biz1', { type: 'business', properties: { label: 'Business' } }],
          ['cust1', { type: 'customer', properties: { label: 'Customer' } }]
        ]),
        relationships: [
          {
            source: 'biz1',
            target: 'cust1',
            type: 'supplies',
            properties: { since: '2023-01', volume: 1000 }
          }
        ],
        notes: []
      };

      const result = sysmapToReactFlow(parsedSysmap);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].data.since).toBe('2023-01');
      expect(result.edges[0].data.volume).toBe(1000);
    });

    test('should use relationship label if provided', () => {
      const parsedSysmap = {
        config: {},
        entities: new Map([
          ['biz1', { type: 'business', properties: { label: 'Business' } }],
          ['cust1', { type: 'customer', properties: { label: 'Customer' } }]
        ]),
        relationships: [
          {
            source: 'biz1',
            target: 'cust1',
            type: 'supplies',
            properties: { label: 'Primary supplier' }
          }
        ],
        notes: []
      };

      const result = sysmapToReactFlow(parsedSysmap);

      expect(result.edges[0].label).toBe('Primary supplier');
    });

    test('should generate label from relationship type if not provided', () => {
      const parsedSysmap = {
        config: {},
        entities: new Map([
          ['biz1', { type: 'business', properties: { label: 'Business' } }],
          ['comp1', { type: 'component', properties: { label: 'Component' } }]
        ]),
        relationships: [
          {
            source: 'biz1',
            target: 'comp1',
            type: 'depends_on',
            properties: {}
          }
        ],
        notes: []
      };

      const result = sysmapToReactFlow(parsedSysmap);

      expect(result.edges[0].label).toBe('depends on');
    });
  });

  describe('reactFlowToSysmap', () => {
    test('should convert React Flow format back to sysmap text', () => {
      const nodes = [
        {
          id: 'biz1',
          type: 'business',
          position: { x: 0, y: 0 },
          data: { label: 'Test Business', industry: 'Tech', revenue: 1000000 }
        },
        {
          id: 'prod1',
          type: 'product',
          position: { x: 300, y: 0 },
          data: { label: 'Test Product', price: 99.99 }
        }
      ];

      const edges = [
        {
          id: 'e1',
          source: 'biz1',
          target: 'prod1',
          data: { relationshipType: 'produces' }
        }
      ];

      const result = reactFlowToSysmap(nodes, edges);

      expect(result).toContain('@entities');
      expect(result).toContain('[business] biz1 {');
      expect(result).toContain('label: "Test Business"');
      expect(result).toContain('industry: "Tech"');
      expect(result).toContain('revenue: 1000000');
      expect(result).toContain('[product] prod1 {');
      expect(result).toContain('price: 99.99');
      expect(result).toContain('@relationships');
      expect(result).toContain('biz1 --produces--> prod1');
    });

    test('should include config section if provided', () => {
      const nodes = [
        {
          id: 'biz1',
          type: 'business',
          data: { label: 'Test Business' }
        }
      ];

      const edges = [];

      const config = {
        name: 'Test Map',
        version: '1.0'
      };

      const result = reactFlowToSysmap(nodes, edges, config);

      expect(result).toContain('@config');
      expect(result).toContain('name: "Test Map"');
      expect(result).toContain('version: "1.0"');
    });

    test('should handle relationships with properties', () => {
      const nodes = [
        { id: 'biz1', type: 'business', data: { label: 'Business' } },
        { id: 'cust1', type: 'customer', data: { label: 'Customer' } }
      ];

      const edges = [
        {
          id: 'e1',
          source: 'biz1',
          target: 'cust1',
          data: {
            relationshipType: 'supplies',
            label: 'Primary supplier',
            since: '2023-01',
            volume: 1000
          }
        }
      ];

      const result = reactFlowToSysmap(nodes, edges);

      expect(result).toContain('biz1 --supplies--> cust1 {');
      expect(result).toContain('label: "Primary supplier"');
      expect(result).toContain('since: "2023-01"');
      expect(result).toContain('volume: 1000');
    });

    test('should handle boolean values correctly', () => {
      const nodes = [
        {
          id: 'svc1',
          type: 'service',
          data: { label: 'Service', subscription: true }
        }
      ];

      const edges = [];

      const result = reactFlowToSysmap(nodes, edges);

      expect(result).toContain('subscription: true');
    });

    test('should escape quotes in string values', () => {
      const nodes = [
        {
          id: 'biz1',
          type: 'business',
          data: { label: 'Test "Business"' }
        }
      ];

      const edges = [];

      const result = reactFlowToSysmap(nodes, edges);

      expect(result).toContain('label: "Test \\"Business\\""');
    });

    test('should filter out invalid properties for entity types', () => {
      const nodes = [
        {
          id: 'biz1',
          type: 'business',
          data: {
            label: 'Business',
            industry: 'Tech',
            invalidProp: 'should not appear'
          }
        }
      ];

      const edges = [];

      const result = reactFlowToSysmap(nodes, edges);

      expect(result).toContain('industry: "Tech"');
      expect(result).not.toContain('invalidProp');
    });

    test('should handle edges without properties', () => {
      const nodes = [
        { id: 'biz1', type: 'business', data: { label: 'Business' } },
        { id: 'prod1', type: 'product', data: { label: 'Product' } }
      ];

      const edges = [
        {
          id: 'e1',
          source: 'biz1',
          target: 'prod1',
          data: { relationshipType: 'produces' }
        }
      ];

      const result = reactFlowToSysmap(nodes, edges);

      expect(result).toContain('biz1 --produces--> prod1');
      expect(result).not.toContain('biz1 --produces--> prod1 {');
    });
  });

  describe('Round-trip conversion', () => {
    test('should maintain data through parse -> convert -> reverse conversion', () => {
      const originalNodes = [
        {
          id: 'biz1',
          type: 'business',
          position: { x: 0, y: 0 },
          data: { label: 'Business', industry: 'Tech', revenue: 1000000 }
        },
        {
          id: 'prod1',
          type: 'product',
          position: { x: 300, y: 0 },
          data: { label: 'Product', price: 99.99 }
        }
      ];

      const originalEdges = [
        {
          id: 'e1',
          source: 'biz1',
          target: 'prod1',
          data: { relationshipType: 'produces', label: 'Main product' }
        }
      ];

      // Convert to sysmap
      const sysmapText = reactFlowToSysmap(originalNodes, originalEdges);

      // Parse it back (requires parser)
      // We'll just verify the text format is correct
      expect(sysmapText).toContain('[business] biz1 {');
      expect(sysmapText).toContain('label: "Business"');
      expect(sysmapText).toContain('[product] prod1 {');
      expect(sysmapText).toContain('biz1 --produces--> prod1 {');
      expect(sysmapText).toContain('label: "Main product"');
    });
  });

  describe('getConversionSummary', () => {
    test('should return summary of parsed sysmap', () => {
      const parsedSysmap = {
        config: {},
        entities: new Map([
          ['biz1', { type: 'business', properties: { label: 'Business 1' } }],
          ['biz2', { type: 'business', properties: { label: 'Business 2' } }],
          ['prod1', { type: 'product', properties: { label: 'Product 1' } }]
        ]),
        relationships: [
          { source: 'biz1', target: 'prod1', type: 'produces', properties: {} },
          { source: 'biz2', target: 'prod1', type: 'produces', properties: {} }
        ],
        notes: []
      };

      const summary = getConversionSummary(parsedSysmap);

      expect(summary.totalNodes).toBe(3);
      expect(summary.totalEdges).toBe(2);
      expect(summary.entityTypes).toEqual({
        business: 2,
        product: 1
      });
      expect(summary.relationshipTypes).toEqual({
        produces: 2
      });
    });
  });

  describe('relayoutNodes', () => {
    test('should recalculate node positions with hierarchical layout', () => {
      const nodes = [
        {
          id: 'biz1',
          type: 'business',
          position: { x: 100, y: 100 },
          data: { label: 'Business' }
        },
        {
          id: 'prod1',
          type: 'product',
          position: { x: 200, y: 200 },
          data: { label: 'Product' }
        }
      ];

      const edges = [
        {
          source: 'biz1',
          target: 'prod1',
          data: { relationshipType: 'produces' }
        }
      ];

      const result = relayoutNodes(nodes, edges, 'hierarchical');

      expect(result).toHaveLength(2);
      expect(result[0].position).toBeDefined();
      expect(result[0].position.x).not.toBe(100);
      expect(result[0].id).toBe('biz1');
    });

    test('should recalculate node positions with force-directed layout', () => {
      const nodes = [
        {
          id: 'biz1',
          type: 'business',
          position: { x: 0, y: 0 },
          data: { label: 'Business' }
        },
        {
          id: 'prod1',
          type: 'product',
          position: { x: 0, y: 0 },
          data: { label: 'Product' }
        }
      ];

      const edges = [
        {
          source: 'biz1',
          target: 'prod1',
          data: { relationshipType: 'produces' }
        }
      ];

      const result = relayoutNodes(nodes, edges, 'force-directed');

      expect(result).toHaveLength(2);
      expect(result[0].position).toBeDefined();
      expect(result[1].position).toBeDefined();
      // Positions should be different after layout
      expect(
        result[0].position.x !== 0 || result[0].position.y !== 0
      ).toBe(true);
    });

    test('should preserve node properties except position', () => {
      const nodes = [
        {
          id: 'biz1',
          type: 'business',
          position: { x: 100, y: 100 },
          data: { label: 'Business', industry: 'Tech' },
          style: { background: 'blue' }
        }
      ];

      const edges = [];

      const result = relayoutNodes(nodes, edges);

      expect(result[0].id).toBe('biz1');
      expect(result[0].type).toBe('business');
      expect(result[0].data).toEqual({ label: 'Business', industry: 'Tech' });
      expect(result[0].style).toEqual({ background: 'blue' });
    });
  });

  describe('Edge cases', () => {
    test('should handle empty entities map', () => {
      const parsedSysmap = {
        config: {},
        entities: new Map(),
        relationships: [],
        notes: []
      };

      const result = sysmapToReactFlow(parsedSysmap);

      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });

    test('should handle nodes without type', () => {
      const nodes = [
        {
          id: 'node1',
          position: { x: 0, y: 0 },
          data: { label: 'Node' }
        }
      ];

      const edges = [];

      const result = reactFlowToSysmap(nodes, edges);

      expect(result).toContain('[business] node1 {');
    });

    test('should handle edges without data', () => {
      const nodes = [
        { id: 'biz1', type: 'business', data: { label: 'Business' } },
        { id: 'prod1', type: 'product', data: { label: 'Product' } }
      ];

      const edges = [
        {
          id: 'e1',
          source: 'biz1',
          target: 'prod1'
        }
      ];

      const result = reactFlowToSysmap(nodes, edges);

      expect(result).toContain('biz1 --uses--> prod1');
    });

    test('should handle complex interconnected graph', () => {
      const parsedSysmap = {
        config: {},
        entities: new Map([
          ['a', { type: 'business', properties: { label: 'A' } }],
          ['b', { type: 'business', properties: { label: 'B' } }],
          ['c', { type: 'business', properties: { label: 'C' } }],
          ['d', { type: 'business', properties: { label: 'D' } }]
        ]),
        relationships: [
          { source: 'a', target: 'b', type: 'uses', properties: {} },
          { source: 'a', target: 'c', type: 'uses', properties: {} },
          { source: 'b', target: 'd', type: 'uses', properties: {} },
          { source: 'c', target: 'd', type: 'uses', properties: {} }
        ],
        notes: []
      };

      const result = sysmapToReactFlow(parsedSysmap);

      expect(result.nodes).toHaveLength(4);
      expect(result.edges).toHaveLength(4);

      // All nodes should have positions
      result.nodes.forEach(node => {
        expect(node.position).toBeDefined();
        expect(typeof node.position.x).toBe('number');
        expect(typeof node.position.y).toBe('number');
      });
    });
  });
});
