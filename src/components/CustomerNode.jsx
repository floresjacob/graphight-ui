// components/CustomerNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';

function CustomerNode({ data }) {
  return (
    <div className="customer-node">
      <Handle type="target" position={Position.Left} />
      <div style={{
        padding: '10px',
        borderRadius: '5px',
        background: '#fff1f2',
        border: '2px solid #fb7185',
        color: '#9f1239'  // Dark red text
      }}>
        <div style={{ fontWeight: 'bold' }}>{data.label}</div>
        <div style={{ fontSize: '0.8em' }}>{data.type}</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default CustomerNode;