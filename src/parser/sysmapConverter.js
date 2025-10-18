/**
 * SYSMAP Converter
 * Converts between parsed SYSMAP format and React Flow format
 */

// Node styling based on entity type
const NODE_STYLES = {
  business: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
    color: '#0D47A1'
  },
  product: {
    backgroundColor: '#F3E5F5',
    borderColor: '#7B1FA2',
    color: '#4A148C'
  },
  service: {
    backgroundColor: '#E8F5E9',
    borderColor: '#388E3C',
    color: '#1B5E20'
  },
  customer: {
    backgroundColor: '#FFF3E0',
    borderColor: '#F57C00',
    color: '#E65100'
  },
  component: {
    backgroundColor: '#ECEFF1',
    borderColor: '#455A64',
    color: '#263238'
  }
};

// Edge styling based on relationship type
const EDGE_STYLES = {
  produces: { animated: true, style: { stroke: '#7B1FA2' } },
  supplies: { animated: false, style: { stroke: '#1976D2' } },
  consumes: { animated: false, style: { stroke: '#F57C00' } },
  uses: { animated: false, style: { stroke: '#388E3C' } },
  depends_on: { animated: true, style: { stroke: '#D32F2F', strokeDasharray: '5,5' } },
  owns: { animated: false, style: { stroke: '#7B1FA2', strokeWidth: 2 } },
  competes_with: { animated: false, style: { stroke: '#D32F2F', strokeDasharray: '3,3' } },
  partners_with: { animated: false, style: { stroke: '#388E3C', strokeWidth: 2 } },
  supports: { animated: false, style: { stroke: '#1976D2' } },
  integrates_with: { animated: true, style: { stroke: '#455A64' } },
  subscribes_to: { animated: false, style: { stroke: '#F57C00' } },
  manages: { animated: false, style: { stroke: '#455A64' } },
  provides: { animated: false, style: { stroke: '#388E3C' } },
  calls: { animated: true, style: { stroke: '#7B1FA2', strokeDasharray: '2,2' } },
  contains: { animated: false, style: { stroke: '#1976D2', strokeWidth: 2 } }
};

/**
 * Simple hierarchical layout algorithm
 * Organizes nodes in layers based on their relationships
 */
function calculateHierarchicalLayout(entities, relationships) {
  const entityIds = Array.from(entities.keys());
  const positions = new Map();

  // Handle empty entities case
  if (entityIds.length === 0) {
    return positions;
  }

  // Calculate in-degree and out-degree for each node
  const inDegree = new Map();
  const outDegree = new Map();
  const children = new Map();

  entityIds.forEach(id => {
    inDegree.set(id, 0);
    outDegree.set(id, 0);
    children.set(id, []);
  });

  relationships.forEach(rel => {
    inDegree.set(rel.target, inDegree.get(rel.target) + 1);
    outDegree.set(rel.source, outDegree.get(rel.source) + 1);
    children.get(rel.source).push(rel.target);
  });

  // Assign nodes to layers using topological sort
  const layers = [];
  const assigned = new Set();
  const queue = [];

  // Start with nodes that have no incoming edges (roots)
  entityIds.forEach(id => {
    if (inDegree.get(id) === 0) {
      queue.push(id);
    }
  });

  // If no roots found, start with nodes that have highest out-degree
  if (queue.length === 0 && entityIds.length > 0) {
    const sorted = [...entityIds].sort((a, b) => outDegree.get(b) - outDegree.get(a));
    queue.push(sorted[0]);
  }

  // Build layers
  while (queue.length > 0 || assigned.size < entityIds.length) {
    if (queue.length === 0) {
      // Add remaining unassigned nodes
      const remaining = entityIds.filter(id => !assigned.has(id));
      if (remaining.length > 0) {
        queue.push(remaining[0]);
      }
    }

    const currentLayer = [...queue];
    layers.push(currentLayer);
    queue.length = 0;

    currentLayer.forEach(id => {
      assigned.add(id);
      children.get(id).forEach(childId => {
        if (!assigned.has(childId) && !queue.includes(childId)) {
          queue.push(childId);
        }
      });
    });
  }

  // Calculate positions
  const HORIZONTAL_SPACING = 300;
  const VERTICAL_SPACING = 150;

  layers.forEach((layer, layerIndex) => {
    const layerWidth = (layer.length - 1) * HORIZONTAL_SPACING;
    const startX = -layerWidth / 2;

    layer.forEach((id, nodeIndex) => {
      positions.set(id, {
        x: startX + nodeIndex * HORIZONTAL_SPACING,
        y: layerIndex * VERTICAL_SPACING
      });
    });
  });

  return positions;
}

/**
 * Force-directed layout algorithm (simple spring model)
 * Better for complex interconnected graphs
 */
function calculateForceDirectedLayout(entities, relationships, iterations = 50) {
  const entityIds = Array.from(entities.keys());
  const positions = new Map();

  // Handle empty entities case
  if (entityIds.length === 0) {
    return positions;
  }

  // Initialize with random positions in a circle
  const radius = Math.max(200, entityIds.length * 30);
  entityIds.forEach((id, index) => {
    const angle = (2 * Math.PI * index) / entityIds.length;
    positions.set(id, {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      vx: 0,
      vy: 0
    });
  });

  // Force parameters
  const REPULSION = 10000;
  const ATTRACTION = 0.01;
  const DAMPING = 0.8;
  const MIN_DISTANCE = 150;

  // Build adjacency for faster lookup
  const adjacent = new Map();
  entityIds.forEach(id => adjacent.set(id, new Set()));
  relationships.forEach(rel => {
    adjacent.get(rel.source).add(rel.target);
    adjacent.get(rel.target).add(rel.source);
  });

  // Simulation iterations
  for (let iter = 0; iter < iterations; iter++) {
    // Calculate forces
    entityIds.forEach(id1 => {
      const pos1 = positions.get(id1);
      let fx = 0;
      let fy = 0;

      entityIds.forEach(id2 => {
        if (id1 === id2) return;

        const pos2 = positions.get(id2);
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        // Repulsion between all nodes
        const repulsion = REPULSION / (distance * distance);
        fx += (dx / distance) * repulsion;
        fy += (dy / distance) * repulsion;

        // Attraction between connected nodes
        if (adjacent.get(id1).has(id2)) {
          const attraction = ATTRACTION * distance;
          fx -= (dx / distance) * attraction;
          fy -= (dy / distance) * attraction;
        }
      });

      // Apply forces
      pos1.vx = (pos1.vx + fx) * DAMPING;
      pos1.vy = (pos1.vy + fy) * DAMPING;
    });

    // Update positions
    entityIds.forEach(id => {
      const pos = positions.get(id);
      pos.x += pos.vx;
      pos.y += pos.vy;
    });
  }

  // Clean up velocity properties and ensure minimum distances
  const finalPositions = new Map();
  entityIds.forEach(id => {
    const pos = positions.get(id);
    finalPositions.set(id, { x: Math.round(pos.x), y: Math.round(pos.y) });
  });

  return finalPositions;
}

/**
 * Convert parsed SYSMAP to React Flow format
 * @param {object} parsedSysmap - Output from parseSysmap()
 * @param {string} layoutAlgorithm - 'hierarchical' or 'force-directed'
 * @param {Map} existingPositions - Optional map of entity ID to {x, y} positions to preserve
 * @returns {object} { nodes, edges }
 */
export function sysmapToReactFlow(parsedSysmap, layoutAlgorithm = 'hierarchical', existingPositions = null) {
  const { entities, relationships } = parsedSysmap;

  // Calculate layout only for nodes without existing positions
  let positions;
  if (existingPositions && existingPositions.size > 0) {
    positions = new Map(existingPositions);
    // Calculate layout for any new nodes not in existingPositions
    const newEntities = new Map();
    entities.forEach((entity, id) => {
      if (!positions.has(id)) {
        newEntities.set(id, entity);
      }
    });
    if (newEntities.size > 0) {
      const newPositions = layoutAlgorithm === 'force-directed'
        ? calculateForceDirectedLayout(newEntities, relationships)
        : calculateHierarchicalLayout(newEntities, relationships);
      newPositions.forEach((pos, id) => positions.set(id, pos));
    }
  } else {
    positions = layoutAlgorithm === 'force-directed'
      ? calculateForceDirectedLayout(entities, relationships)
      : calculateHierarchicalLayout(entities, relationships);
  }

  // Convert entities to React Flow nodes
  const nodes = Array.from(entities.entries()).map(([id, entity]) => {
    const position = positions.get(id) || { x: 0, y: 0 };
    const style = NODE_STYLES[entity.type] || NODE_STYLES.business;

    return {
      id,
      type: entity.type,
      position,
      data: {
        label: entity.properties.label,
        ...entity.properties
      },
      style: {
        background: style.backgroundColor,
        border: `2px solid ${style.borderColor}`,
        color: style.color,
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px',
        minWidth: '150px'
      }
    };
  });

  // Convert relationships to React Flow edges
  const edges = relationships.map((rel, index) => {
    const edgeStyle = EDGE_STYLES[rel.type] || {};
    const label = rel.properties.label || rel.type.replace(/_/g, ' ');

    return {
      id: `e-${rel.source}-${rel.target}-${index}`,
      source: rel.source,
      target: rel.target,
      label,
      type: 'smoothstep',
      animated: edgeStyle.animated || false,
      style: edgeStyle.style || {},
      data: {
        relationshipType: rel.type,
        ...rel.properties
      }
    };
  });

  return { nodes, edges };
}

/**
 * Convert React Flow format back to SYSMAP text
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @param {object} config - Optional config metadata
 * @returns {string} .sysmap file content
 */
export function reactFlowToSysmap(nodes, edges, config = {}) {
  const lines = [];

  // Generate @config section
  if (config && Object.keys(config).length > 0) {
    lines.push('@config');
    Object.entries(config).forEach(([key, value]) => {
      const formattedValue = typeof value === 'string' ? `"${value}"` : value;
      lines.push(`${key}: ${formattedValue}`);
    });
    lines.push('');
  }

  // Generate @entities section
  lines.push('@entities');
  lines.push('');

  nodes.forEach(node => {
    const entityType = node.type || 'business';
    const entityId = node.id;

    // Add position annotation as comment
    if (node.position) {
      lines.push(`# @position ${Math.round(node.position.x)} ${Math.round(node.position.y)}`);
    }
    lines.push(`[${entityType}] ${entityId} {`);

    // Add properties from node data
    if (node.data) {
      Object.entries(node.data).forEach(([key, value]) => {
        // Skip special React Flow properties
        if (key === 'label' || isValidProperty(key, entityType)) {
          const formattedValue = formatValue(value);
          lines.push(`  ${key}: ${formattedValue}`);
        }
      });
    }

    lines.push('}');
    lines.push('');
  });

  // Generate @relationships section
  if (edges.length > 0) {
    lines.push('@relationships');
    lines.push('');

    edges.forEach(edge => {
      const relationshipType = edge.data?.relationshipType || 'uses';
      const source = edge.source;
      const target = edge.target;

      // Check if edge has properties
      const hasProperties = edge.data && Object.keys(edge.data).some(
        key => key !== 'relationshipType' && isValidRelationshipProperty(key)
      );

      if (hasProperties) {
        lines.push(`${source} --${relationshipType}--> ${target} {`);

        Object.entries(edge.data).forEach(([key, value]) => {
          if (key !== 'relationshipType' && isValidRelationshipProperty(key)) {
            const formattedValue = formatValue(value);
            lines.push(`  ${key}: ${formattedValue}`);
          }
        });

        lines.push('}');
      } else {
        lines.push(`${source} --${relationshipType}--> ${target}`);
      }

      lines.push('');
    });
  }

  return lines.join('\n');
}

/**
 * Check if a property is valid for an entity type
 */
function isValidProperty(key, entityType) {
  const validProperties = {
    business: ['industry', 'location', 'revenue', 'employees', 'founded', 'status'],
    product: ['category', 'price', 'release_date', 'version', 'status', 'sku'],
    service: ['type', 'subscription', 'monthly_fee', 'sla', 'status'],
    customer: ['type', 'location', 'segment', 'ltv', 'acquisition_date'],
    component: ['type', 'technology', 'version', 'status', 'owner']
  };

  return validProperties[entityType]?.includes(key) || false;
}

/**
 * Check if a property is valid for relationships
 */
function isValidRelationshipProperty(key) {
  const validProperties = ['label', 'since', 'strength', 'status', 'volume', 'value'];
  return validProperties.includes(key);
}

/**
 * Format a value for SYSMAP output
 */
function formatValue(value) {
  if (typeof value === 'string') {
    // Escape quotes in strings
    const escaped = value.replace(/"/g, '\\"');
    return `"${escaped}"`;
  } else if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  } else if (typeof value === 'number') {
    return value.toString();
  }
  return `"${String(value)}"`;
}

/**
 * Extract position annotations from .sysmap text
 * @param {string} sysmapText - Raw .sysmap file content
 * @returns {Map} Map of entity ID to {x, y} position
 */
export function extractPositions(sysmapText) {
  const positions = new Map();
  const lines = sysmapText.split('\n');

  let lastPosition = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for position annotation comment
    if (line.startsWith('# @position')) {
      const match = line.match(/# @position\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/);
      if (match) {
        lastPosition = {
          x: parseFloat(match[1]),
          y: parseFloat(match[2])
        };
      }
    }

    // Check for entity declaration
    if (line.match(/^\[[\w]+\]\s+([\w\-_]+)\s*\{$/)) {
      const entityMatch = line.match(/^\[[\w]+\]\s+([\w\-_]+)\s*\{$/);
      if (entityMatch && lastPosition) {
        positions.set(entityMatch[1], lastPosition);
        lastPosition = null;
      }
    }
  }

  return positions;
}

/**
 * Get a summary of the conversion
 */
export function getConversionSummary(parsedSysmap) {
  const { entities, relationships } = parsedSysmap;

  return {
    totalNodes: entities.size,
    totalEdges: relationships.length,
    entityTypes: Array.from(entities.values()).reduce((acc, entity) => {
      acc[entity.type] = (acc[entity.type] || 0) + 1;
      return acc;
    }, {}),
    relationshipTypes: relationships.reduce((acc, rel) => {
      acc[rel.type] = (acc[rel.type] || 0) + 1;
      return acc;
    }, {})
  };
}

/**
 * Re-layout existing nodes using specified algorithm
 */
export function relayoutNodes(nodes, edges, layoutAlgorithm = 'hierarchical') {
  // Convert to intermediate format
  const entities = new Map();
  nodes.forEach(node => {
    entities.set(node.id, {
      type: node.type || 'business',
      properties: node.data || {}
    });
  });

  const relationships = edges.map(edge => ({
    source: edge.source,
    target: edge.target,
    type: edge.data?.relationshipType || 'uses',
    properties: {}
  }));

  // Calculate new positions
  const positions = layoutAlgorithm === 'force-directed'
    ? calculateForceDirectedLayout(entities, relationships)
    : calculateHierarchicalLayout(entities, relationships);

  // Update node positions
  return nodes.map(node => ({
    ...node,
    position: positions.get(node.id) || node.position
  }));
}

export default {
  sysmapToReactFlow,
  reactFlowToSysmap,
  extractPositions,
  getConversionSummary,
  relayoutNodes
};
