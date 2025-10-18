// components/EdgeEditor.jsx
import React, { useState, useEffect } from 'react';

// Valid relationship types from spec
const RELATIONSHIP_TYPES = [
  { value: 'produces', label: 'Produces' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'consumes', label: 'Consumes' },
  { value: 'uses', label: 'Uses' },
  { value: 'depends_on', label: 'Depends On' },
  { value: 'owns', label: 'Owns' },
  { value: 'competes_with', label: 'Competes With' },
  { value: 'partners_with', label: 'Partners With' },
  { value: 'supports', label: 'Supports' },
  { value: 'integrates_with', label: 'Integrates With' },
  { value: 'subscribes_to', label: 'Subscribes To' },
  { value: 'manages', label: 'Manages' },
  { value: 'provides', label: 'Provides' },
  { value: 'calls', label: 'Calls' },
  { value: 'contains', label: 'Contains' }
];

// Valid relationship properties from spec
const PROPERTY_DEFINITIONS = [
  { key: 'label', label: 'Label', type: 'text' },
  { key: 'since', label: 'Since', type: 'text' },
  { key: 'strength', label: 'Strength', type: 'text', placeholder: 'e.g., strong, medium, weak' },
  { key: 'status', label: 'Status', type: 'text', placeholder: 'e.g., active, inactive' },
  { key: 'volume', label: 'Volume', type: 'number' },
  { key: 'value', label: 'Value', type: 'number' }
];

function EdgeEditor({ edge, nodes, onUpdate, onDelete, onClose }) {
  const [relationshipType, setRelationshipType] = useState(edge.data?.relationshipType || 'uses');
  const [properties, setProperties] = useState({
    label: edge.label || '',
    since: edge.data?.since || '',
    strength: edge.data?.strength || '',
    status: edge.data?.status || '',
    volume: edge.data?.volume || '',
    value: edge.data?.value || ''
  });

  useEffect(() => {
    setRelationshipType(edge.data?.relationshipType || 'uses');
    setProperties({
      label: edge.label || '',
      since: edge.data?.since || '',
      strength: edge.data?.strength || '',
      status: edge.data?.status || '',
      volume: edge.data?.volume || '',
      value: edge.data?.value || ''
    });
  }, [edge]);

  const handlePropertyChange = (key, value) => {
    const newProperties = { ...properties, [key]: value };
    setProperties(newProperties);

    // Build updated edge data
    const updatedData = {
      ...edge.data,
      relationshipType,
      ...Object.fromEntries(
        Object.entries(newProperties).filter(([_, v]) => v !== '' && v !== undefined)
      )
    };

    // Update edge
    onUpdate({
      ...edge,
      label: newProperties.label || relationshipType.replace(/_/g, ' '),
      data: updatedData
    });
  };

  const handleTypeChange = (newType) => {
    setRelationshipType(newType);

    // Update edge with new type
    const updatedData = {
      ...edge.data,
      relationshipType: newType,
      ...Object.fromEntries(
        Object.entries(properties).filter(([_, v]) => v !== '' && v !== undefined)
      )
    };

    onUpdate({
      ...edge,
      label: properties.label || newType.replace(/_/g, ' '),
      data: updatedData
    });
  };

  // Find source and target node labels
  const sourceNode = nodes.find(n => n.id === edge.source);
  const targetNode = nodes.find(n => n.id === edge.target);

  return (
    <div
      style={{
        borderTop: '2px solid #7B1FA2',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        maxHeight: '50vh',
        overflow: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#7B1FA2' }}>
          Edit Relationship
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#6c757d'
          }}
        >
          ×
        </button>
      </div>

      {/* Connection Info */}
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <div style={{ fontSize: '12px', color: '#495057' }}>
          <strong>From:</strong> {sourceNode?.data?.label || edge.source}
        </div>
        <div style={{ fontSize: '12px', color: '#495057', marginTop: '5px' }}>
          <strong>To:</strong> {targetNode?.data?.label || edge.target}
        </div>
      </div>

      {/* Relationship Type Dropdown */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>
          Relationship Type
        </label>
        <select
          value={relationshipType}
          onChange={(e) => handleTypeChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '12px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        >
          {RELATIONSHIP_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic Properties */}
      {PROPERTY_DEFINITIONS.map(propDef => (
        <div key={propDef.key} style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>
            {propDef.label}
          </label>

          {propDef.type === 'number' ? (
            <input
              type="number"
              value={properties[propDef.key] ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                handlePropertyChange(propDef.key, val);
              }}
              placeholder={propDef.placeholder}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          ) : (
            <input
              type="text"
              value={properties[propDef.key] ?? ''}
              onChange={(e) => handlePropertyChange(propDef.key, e.target.value || undefined)}
              placeholder={propDef.placeholder}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          )}
        </div>
      ))}

      {/* Delete Button */}
      <button
        onClick={() => {
          const fromLabel = sourceNode?.data?.label || edge.source;
          const toLabel = targetNode?.data?.label || edge.target;
          if (window.confirm(`Delete relationship from "${fromLabel}" to "${toLabel}"?`)) {
            onDelete(edge.id);
          }
        }}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          marginTop: '10px'
        }}
      >
        Delete Relationship
      </button>
    </div>
  );
}

export default EdgeEditor;
