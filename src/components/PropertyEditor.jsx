// components/PropertyEditor.jsx
import React, { useState, useEffect } from 'react';

// Property definitions for each entity type
const PROPERTY_DEFINITIONS = {
  business: [
    { key: 'label', label: 'Label', type: 'text', required: true },
    { key: 'industry', label: 'Industry', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'revenue', label: 'Revenue', type: 'number' },
    { key: 'employees', label: 'Employees', type: 'number' },
    { key: 'founded', label: 'Founded', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' }
  ],
  product: [
    { key: 'label', label: 'Label', type: 'text', required: true },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'price', label: 'Price', type: 'number' },
    { key: 'release_date', label: 'Release Date', type: 'text' },
    { key: 'version', label: 'Version', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'sku', label: 'SKU', type: 'text' }
  ],
  service: [
    { key: 'label', label: 'Label', type: 'text', required: true },
    { key: 'type', label: 'Type', type: 'text' },
    { key: 'subscription', label: 'Subscription', type: 'boolean' },
    { key: 'monthly_fee', label: 'Monthly Fee', type: 'number' },
    { key: 'sla', label: 'SLA', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' }
  ],
  customer: [
    { key: 'label', label: 'Label', type: 'text', required: true },
    { key: 'type', label: 'Type', type: 'text' },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'segment', label: 'Segment', type: 'text' },
    { key: 'ltv', label: 'LTV', type: 'number' },
    { key: 'acquisition_date', label: 'Acquisition Date', type: 'text' }
  ],
  component: [
    { key: 'label', label: 'Label', type: 'text', required: true },
    { key: 'type', label: 'Type', type: 'text' },
    { key: 'technology', label: 'Technology', type: 'text' },
    { key: 'version', label: 'Version', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'owner', label: 'Owner', type: 'text' }
  ]
};

const ENTITY_TYPES = ['business', 'product', 'service', 'customer', 'component'];

function PropertyEditor({ node, onUpdate, onDelete, onClose }) {
  const [localData, setLocalData] = useState({ ...node.data });
  const [nodeType, setNodeType] = useState(node.type || 'business');

  useEffect(() => {
    setLocalData({ ...node.data });
    setNodeType(node.type || 'business');
  }, [node]);

  const handlePropertyChange = (key, value) => {
    const newData = { ...localData, [key]: value };
    setLocalData(newData);

    // Immediately update parent
    onUpdate({
      ...node,
      data: newData,
      type: nodeType
    });
  };

  const handleTypeChange = (newType) => {
    setNodeType(newType);

    // When type changes, preserve label but reset other properties
    const newData = { label: localData.label || '' };
    setLocalData(newData);

    onUpdate({
      ...node,
      type: newType,
      data: newData
    });
  };

  const propertyDefs = PROPERTY_DEFINITIONS[nodeType] || PROPERTY_DEFINITIONS.business;

  return (
    <div
      style={{
        borderTop: '2px solid #007bff',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        maxHeight: '50vh',
        overflow: 'auto'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          Edit Node
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

      {/* Node ID (read-only) */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>
          Node ID
        </label>
        <input
          type="text"
          value={node.id}
          readOnly
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '12px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            backgroundColor: '#e9ecef',
            boxSizing: 'border-box'
          }}
        />
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

      {/* Dynamic Properties */}
      {propertyDefs.map(propDef => (
        <div key={propDef.key} style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#495057' }}>
            {propDef.label}
            {propDef.required && <span style={{ color: '#dc3545' }}>*</span>}
          </label>

          {propDef.type === 'boolean' ? (
            <select
              value={localData[propDef.key] === true ? 'true' : localData[propDef.key] === false ? 'false' : ''}
              onChange={(e) => {
                const val = e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined;
                handlePropertyChange(propDef.key, val);
              }}
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Not set</option>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          ) : propDef.type === 'number' ? (
            <input
              type="number"
              value={localData[propDef.key] ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                handlePropertyChange(propDef.key, val);
              }}
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
              value={localData[propDef.key] ?? ''}
              onChange={(e) => handlePropertyChange(propDef.key, e.target.value || undefined)}
              required={propDef.required}
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
          if (window.confirm(`Delete node "${localData.label || node.id}"?`)) {
            onDelete(node.id);
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
        Delete Node
      </button>
    </div>
  );
}

export default PropertyEditor;
