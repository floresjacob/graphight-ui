// components/NodeCreator.jsx
import React, { useState } from 'react';

const ENTITY_TYPES = ['business', 'product', 'service', 'customer', 'component'];

function NodeCreator({ onCreateNode, onClose, existingNodes }) {
  const [nodeType, setNodeType] = useState('business');
  const [nodeId, setNodeId] = useState('');
  const [label, setLabel] = useState('');
  const [autoGenerateId, setAutoGenerateId] = useState(true);

  const generateNodeId = (label, type) => {
    // Generate ID from label
    const baseId = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    // Ensure uniqueness
    let id = baseId || type;
    let counter = 1;
    const existingIds = new Set(existingNodes.map(n => n.id));

    while (existingIds.has(id)) {
      id = `${baseId || type}_${counter}`;
      counter++;
    }

    return id;
  };

  const handleLabelChange = (newLabel) => {
    setLabel(newLabel);
    if (autoGenerateId) {
      setNodeId(generateNodeId(newLabel, nodeType));
    }
  };

  const handleTypeChange = (newType) => {
    setNodeType(newType);
    if (autoGenerateId) {
      setNodeId(generateNodeId(label, newType));
    }
  };

  const handleCreate = () => {
    if (!label.trim()) {
      alert('Label is required');
      return;
    }

    const finalId = autoGenerateId ? generateNodeId(label, nodeType) : nodeId;

    if (!finalId.trim()) {
      alert('Node ID is required');
      return;
    }

    // Check if ID already exists
    if (existingNodes.some(n => n.id === finalId)) {
      alert(`Node ID "${finalId}" already exists. Please use a different ID.`);
      return;
    }

    // Validate ID format
    if (!/^[a-zA-Z][\w\-_]*$/.test(finalId)) {
      alert('Node ID must start with a letter and contain only letters, numbers, underscores, and hyphens.');
      return;
    }

    onCreateNode({
      id: finalId,
      type: nodeType,
      label: label.trim()
    });

    // Reset form
    setLabel('');
    setNodeId('');
    setAutoGenerateId(true);
  };

  return (
    <div
      style={{
        borderTop: '2px solid #28a745',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        marginBottom: '15px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>
          Create New Node
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

      {/* Node Type Dropdown */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>
          Node Type
        </label>
        <select
          value={nodeType}
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
          {ENTITY_TYPES.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Label Input */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>
          Label <span style={{ color: '#dc3545' }}>*</span>
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => handleLabelChange(e.target.value)}
          placeholder="e.g., My Company"
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '12px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Auto-generate ID checkbox */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={autoGenerateId}
            onChange={(e) => {
              setAutoGenerateId(e.target.checked);
              if (e.target.checked) {
                setNodeId(generateNodeId(label, nodeType));
              }
            }}
            style={{ marginRight: '8px' }}
          />
          Auto-generate Node ID
        </label>
      </div>

      {/* Node ID Input (only if not auto-generating) */}
      {!autoGenerateId && (
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>
            Node ID <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <input
            type="text"
            value={nodeId}
            onChange={(e) => setNodeId(e.target.value)}
            placeholder="e.g., my_company"
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
          <small style={{ fontSize: '10px', color: '#6c757d' }}>
            Must start with a letter, can contain letters, numbers, underscores, and hyphens
          </small>
        </div>
      )}

      {/* Preview of generated ID */}
      {autoGenerateId && label && (
        <div style={{ marginBottom: '15px', padding: '8px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
          <small style={{ fontSize: '11px', color: '#495057' }}>
            <strong>Generated ID:</strong> <code>{generateNodeId(label, nodeType)}</code>
          </small>
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={handleCreate}
        style={{
          width: '100%',
          padding: '10px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        Create Node
      </button>
    </div>
  );
}

export default NodeCreator;
