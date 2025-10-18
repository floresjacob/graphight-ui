/**
 * SYSMAP Parser
 * Parses .sysmap files according to SYSMAP_SPEC.md
 */

// Valid entity types from spec
const VALID_ENTITY_TYPES = ['business', 'product', 'service', 'customer', 'component'];

// Valid property names for each entity type
const ENTITY_PROPERTIES = {
  business: ['label', 'industry', 'location', 'revenue', 'employees', 'founded', 'status'],
  product: ['label', 'category', 'price', 'release_date', 'version', 'status', 'sku'],
  service: ['label', 'type', 'subscription', 'monthly_fee', 'sla', 'status'],
  customer: ['label', 'type', 'location', 'segment', 'ltv', 'acquisition_date'],
  component: ['label', 'type', 'technology', 'version', 'status', 'owner']
};

// Valid relationship arrow types
const RELATIONSHIP_ARROWS = [
  'produces', 'supplies', 'consumes', 'uses', 'depends_on', 'owns',
  'competes_with', 'partners_with', 'supports', 'integrates_with',
  'subscribes_to', 'manages', 'provides', 'calls', 'contains'
];

// Valid relationship properties
const RELATIONSHIP_PROPERTIES = ['label', 'since', 'strength', 'status', 'volume', 'value'];

/**
 * Parse error class
 */
class ParseError extends Error {
  constructor(message, line = null) {
    super(line !== null ? `Line ${line}: ${message}` : message);
    this.name = 'ParseError';
    this.line = line;
  }
}

/**
 * Remove comments from a line
 */
function removeComments(line) {
  const commentIndex = line.indexOf('#');
  if (commentIndex === -1) return line;
  return line.substring(0, commentIndex);
}

/**
 * Parse a string value (remove quotes and handle escaping)
 */
function parseStringValue(value, line) {
  const trimmed = value.trim();
  if (!trimmed.startsWith('"') || !trimmed.endsWith('"')) {
    throw new ParseError(`String value must be enclosed in double quotes: ${value}`, line);
  }
  // Remove outer quotes and handle escaped quotes
  return trimmed.slice(1, -1).replace(/\\"/g, '"');
}

/**
 * Parse a number value
 */
function parseNumberValue(value, line) {
  const trimmed = value.trim();
  const num = Number(trimmed);
  if (isNaN(num)) {
    throw new ParseError(`Invalid number value: ${value}`, line);
  }
  return num;
}

/**
 * Parse a boolean value
 */
function parseBooleanValue(value, line) {
  const trimmed = value.trim();
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  throw new ParseError(`Invalid boolean value (must be 'true' or 'false'): ${value}`, line);
}

/**
 * Parse a property value based on its content
 */
function parseValue(value, line) {
  const trimmed = value.trim();

  // String (starts and ends with quotes)
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return parseStringValue(trimmed, line);
  }

  // Boolean
  if (trimmed === 'true' || trimmed === 'false') {
    return parseBooleanValue(trimmed, line);
  }

  // Number
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return parseNumberValue(trimmed, line);
  }

  throw new ParseError(`Invalid value format: ${value}`, line);
}

/**
 * Parse a property line (key: value)
 */
function parseProperty(line, lineNum) {
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) {
    throw new ParseError('Property must be in format "key: value"', lineNum);
  }

  const key = line.substring(0, colonIndex).trim();
  const value = line.substring(colonIndex + 1).trim();

  if (!key) {
    throw new ParseError('Property key cannot be empty', lineNum);
  }

  if (!value) {
    throw new ParseError(`Property value cannot be empty for key: ${key}`, lineNum);
  }

  return { key, value: parseValue(value, lineNum) };
}

/**
 * Parse @config section
 */
function parseConfigSection(lines, startIdx) {
  const config = {};
  let i = startIdx + 1;

  while (i < lines.length) {
    const line = lines[i].content.trim();

    // Empty line or next section
    if (!line || line.startsWith('@')) {
      break;
    }

    const { key, value } = parseProperty(line, lines[i].lineNum);
    config[key] = value;
    i++;
  }

  return { config, nextIdx: i };
}

/**
 * Parse entity ID and type from entity declaration line
 * Format: [type] entity_id {
 */
function parseEntityDeclaration(line, lineNum) {
  const match = line.match(/^\[([\w]+)\]\s+([\w\-_]+)\s*\{$/);
  if (!match) {
    throw new ParseError('Invalid entity declaration. Expected format: [type] entity_id {', lineNum);
  }

  const [, type, id] = match;

  // Validate entity type
  if (!VALID_ENTITY_TYPES.includes(type)) {
    throw new ParseError(
      `Unknown entity type: ${type}. Valid types: ${VALID_ENTITY_TYPES.join(', ')}`,
      lineNum
    );
  }

  // Validate entity ID format
  if (!/^[a-zA-Z][\w\-_]*$/.test(id)) {
    throw new ParseError(
      `Invalid entity ID: ${id}. Must start with a letter and contain only letters, numbers, underscores, and hyphens`,
      lineNum
    );
  }

  return { type, id };
}

/**
 * Parse @entities section
 */
function parseEntitiesSection(lines, startIdx) {
  const entities = new Map();
  let i = startIdx + 1;

  while (i < lines.length) {
    const line = lines[i].content.trim();

    // Empty line
    if (!line) {
      i++;
      continue;
    }

    // Next section
    if (line.startsWith('@')) {
      break;
    }

    // Entity declaration
    if (line.startsWith('[')) {
      const { type, id } = parseEntityDeclaration(line, lines[i].lineNum);

      // Check for duplicate ID
      if (entities.has(id)) {
        throw new ParseError(`Duplicate entity ID: ${id}`, lines[i].lineNum);
      }

      const properties = {};
      i++;

      // Parse entity properties
      while (i < lines.length) {
        const propLine = lines[i].content.trim();

        // End of entity
        if (propLine === '}') {
          i++;
          break;
        }

        // Empty line within entity
        if (!propLine) {
          i++;
          continue;
        }

        const { key, value } = parseProperty(propLine, lines[i].lineNum);

        // Validate property for entity type
        const validProps = ENTITY_PROPERTIES[type];
        if (!validProps.includes(key)) {
          console.warn(
            `Line ${lines[i].lineNum}: Unknown property '${key}' for entity type '${type}'. Valid properties: ${validProps.join(', ')}`
          );
        }

        properties[key] = value;
        i++;
      }

      // Validate required 'label' property
      if (!properties.label) {
        throw new ParseError(`Entity '${id}' is missing required property 'label'`, lines[i - 1].lineNum);
      }

      entities.set(id, { type, properties });
    } else {
      throw new ParseError(`Unexpected content in @entities section: ${line}`, lines[i].lineNum);
    }
  }

  return { entities, nextIdx: i };
}

/**
 * Parse relationship declaration
 * Format: source_id --arrow_type--> target_id
 * or: source_id --arrow_type--> target_id {
 */
function parseRelationshipDeclaration(line, lineNum) {
  const match = line.match(/^([\w\-_]+)\s+--(\w+)-->\s+([\w\-_]+)(\s*\{)?$/);
  if (!match) {
    throw new ParseError(
      'Invalid relationship declaration. Expected format: source_id --arrow_type--> target_id',
      lineNum
    );
  }

  const [, source, arrowType, target, hasProps] = match;

  // Validate arrow type (warning only)
  if (!RELATIONSHIP_ARROWS.includes(arrowType)) {
    console.warn(
      `Line ${lineNum}: Unknown relationship arrow type '${arrowType}'. Valid types: ${RELATIONSHIP_ARROWS.join(', ')}`
    );
  }

  return { source, target, type: arrowType, hasProperties: !!hasProps };
}

/**
 * Parse @relationships section
 */
function parseRelationshipsSection(lines, startIdx, entities) {
  const relationships = [];
  let i = startIdx + 1;

  while (i < lines.length) {
    const line = lines[i].content.trim();

    // Empty line
    if (!line) {
      i++;
      continue;
    }

    // Next section
    if (line.startsWith('@')) {
      break;
    }

    // Relationship declaration
    const { source, target, type, hasProperties } = parseRelationshipDeclaration(line, lines[i].lineNum);

    // Validate that source and target entities exist
    if (!entities.has(source)) {
      throw new ParseError(`Undefined entity ID in relationship source: ${source}`, lines[i].lineNum);
    }
    if (!entities.has(target)) {
      throw new ParseError(`Undefined entity ID in relationship target: ${target}`, lines[i].lineNum);
    }

    const relationship = { source, target, type, properties: {} };
    i++;

    // Parse relationship properties if present
    if (hasProperties) {
      while (i < lines.length) {
        const propLine = lines[i].content.trim();

        // End of relationship properties
        if (propLine === '}') {
          i++;
          break;
        }

        // Empty line within properties
        if (!propLine) {
          i++;
          continue;
        }

        const { key, value } = parseProperty(propLine, lines[i].lineNum);

        // Validate property (warning only)
        if (!RELATIONSHIP_PROPERTIES.includes(key)) {
          console.warn(
            `Line ${lines[i].lineNum}: Unknown relationship property '${key}'. Valid properties: ${RELATIONSHIP_PROPERTIES.join(', ')}`
          );
        }

        relationship.properties[key] = value;
        i++;
      }
    }

    relationships.push(relationship);
  }

  return { relationships, nextIdx: i };
}

/**
 * Parse @notes section
 */
function parseNotesSection(lines, startIdx) {
  const notes = [];
  let i = startIdx + 1;

  while (i < lines.length) {
    const line = lines[i].content.trim();

    // Next section
    if (line.startsWith('@')) {
      break;
    }

    // Add non-empty lines to notes
    if (line) {
      notes.push(line);
    }

    i++;
  }

  return { notes, nextIdx: i };
}

/**
 * Main parser function
 * @param {string} sysmapContent - The content of a .sysmap file
 * @returns {object} Parsed structure with config, entities, relationships, and notes
 */
export function parseSysmap(sysmapContent) {
  if (typeof sysmapContent !== 'string') {
    throw new ParseError('Input must be a string');
  }

  // Split into lines and remove comments, preserving line numbers
  const lines = sysmapContent.split('\n').map((line, idx) => ({
    content: removeComments(line),
    lineNum: idx + 1
  }));

  // Initialize result structure
  const result = {
    config: {},
    entities: new Map(),
    relationships: [],
    notes: []
  };

  // Track which sections we've seen
  const seenSections = new Set();
  const sectionOrder = ['@config', '@entities', '@relationships', '@notes'];
  let lastSectionIndex = -1;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].content.trim();

    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // Section header
    if (line.startsWith('@')) {
      const section = line.toLowerCase();

      // Check for duplicate sections
      if (seenSections.has(section)) {
        throw new ParseError(`Duplicate section: ${section}`, lines[i].lineNum);
      }

      // Check section order
      const currentSectionIndex = sectionOrder.indexOf(section);
      if (currentSectionIndex === -1) {
        throw new ParseError(`Unknown section: ${line}`, lines[i].lineNum);
      }
      if (currentSectionIndex < lastSectionIndex) {
        throw new ParseError(
          `Sections must appear in order: ${sectionOrder.join(', ')}`,
          lines[i].lineNum
        );
      }

      seenSections.add(section);
      lastSectionIndex = currentSectionIndex;

      // Parse section
      if (section === '@config') {
        const { config, nextIdx } = parseConfigSection(lines, i);
        result.config = config;
        i = nextIdx;
      } else if (section === '@entities') {
        const { entities, nextIdx } = parseEntitiesSection(lines, i);
        result.entities = entities;
        i = nextIdx;
      } else if (section === '@relationships') {
        const { relationships, nextIdx } = parseRelationshipsSection(lines, i, result.entities);
        result.relationships = relationships;
        i = nextIdx;
      } else if (section === '@notes') {
        const { notes, nextIdx } = parseNotesSection(lines, i);
        result.notes = notes;
        i = nextIdx;
      }
    } else {
      throw new ParseError(`Unexpected content outside of sections: ${line}`, lines[i].lineNum);
    }
  }

  // Validate that @entities section exists
  if (!seenSections.has('@entities')) {
    throw new ParseError('@entities section is required');
  }

  return result;
}

/**
 * Parse a .sysmap file and return a summary
 */
export function getSysmapSummary(sysmapContent) {
  try {
    const parsed = parseSysmap(sysmapContent);

    return {
      success: true,
      entityCount: parsed.entities.size,
      relationshipCount: parsed.relationships.length,
      hasConfig: Object.keys(parsed.config).length > 0,
      hasNotes: parsed.notes.length > 0,
      entityTypes: Array.from(parsed.entities.values()).reduce((acc, entity) => {
        acc[entity.type] = (acc[entity.type] || 0) + 1;
        return acc;
      }, {})
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

export default parseSysmap;
