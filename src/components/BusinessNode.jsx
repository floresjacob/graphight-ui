// components/BusinessNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';


function BusinessNode({ data }) {
  return (
    <div className="business-node">
      <Handle type="target" position={Position.Left} />
      <div style={{
        padding: '10px',
        borderRadius: '5px',
        background: '#f0f9ff',
        border: '2px solid #3b82f6',
        color: '#1e3a8a'  // Dark blue text
      }}>
        <div style={{ fontWeight: 'bold' }}>{data.label}</div>
        <div style={{ fontSize: '0.8em' }}>{data.industry}</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default BusinessNode;