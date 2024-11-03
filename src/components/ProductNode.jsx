// components/ProductNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';

// components/ProductNode.jsx
function ProductNode({ data }) {
  return (
    <div className="product-node">
      <Handle type="target" position={Position.Left} />
      <div style={{
        padding: '10px',
        borderRadius: '5px',
        background: '#f0fdf4',
        border: '2px solid #22c55e',
        color: '#166534'  // Dark green text
      }}>
        <div style={{ fontWeight: 'bold' }}>{data.label}</div>
        <div style={{ fontSize: '0.8em' }}>${data.price}</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default ProductNode;


