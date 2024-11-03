// components/NodeCreator.jsx
import React, { useState } from 'react';
import { generateUniqueId, saveDataToFile } from '../utils/dataUtils';

function NodeCreator({ onAddNode, nodes }) {
  const [nodeType, setNodeType] = useState('business');
  const [nodeName, setNodeName] = useState('');
  const [nodeDetails, setNodeDetails] = useState({});

  const nodeTypeOptions = {
    business: {
      fields: ['industry', 'location', 'revenue'],
      color: '#f0f9ff',
      border: '#3b82f6'
    },
    product: {
      fields: ['category', 'price', 'releaseDate'],
      color: '#f0fdf4',
      border: '#22c55e'
    },
    service: {
      fields: ['type', 'subscription', 'monthlyFee'],
      color: '#fdf4ff',
      border: '#d946ef'
    },
    customer: {
      fields: ['type', 'location'],
      color: '#fff1f2',
      border: '#fb7185'
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate position - place new node slightly offset from center
    const position = {
      x: Math.random() * 100 + 100,
      y: Math.random() * 100 + 100
    };

    const newNode = {
      id: generateUniqueId(),
      type: nodeType,
      position,
      data: {
        label: nodeName,
        ...nodeDetails
      }
    };

    onAddNode(newNode);
    
    // Reset form
    setNodeName('');
    setNodeDetails({});
  };

  const handleDetailChange = (field, value) => {
    setNodeDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="node-creator" style={{ padding: '15px', borderBottom: '1px solid #ccc' }}>
      <h3 style={{ marginBottom: '10px' }}>Create New Node</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Node Type:</label>
          <select
            value={nodeType}
            onChange={(e) => setNodeType(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="business">Business</option>
            <option value="product">Product</option>
            <option value="service">Service</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
          <input
            type="text"
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            required
          />
        </div>

        {nodeTypeOptions[nodeType].fields.map(field => (
          <div key={field} style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              {field.charAt(0).toUpperCase() + field.slice(1)}:
            </label>
            <input
              type={field.includes('price') || field.includes('fee') || field.includes('revenue') ? 'number' : 'text'}
              value={nodeDetails[field] || ''}
              onChange={(e) => handleDetailChange(field, e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc'
              }}
            />
          </div>
        ))}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create Node
        </button>
      </form>
    </div>
  );
}

export default NodeCreator;