// components/ServiceNode.jsx
import React from 'react';
import { Handle, Position } from 'reactflow';

function ServiceNode({ data }) {
  return (
    <div className="service-node">
      <Handle type="target" position={Position.Left} />
      <div style={{
        padding: '10px',
        borderRadius: '5px',
        background: '#fdf4ff',
        border: '2px solid #d946ef',
        color: '#86198f'  // Dark purple text
      }}>
        <div style={{ fontWeight: 'bold' }}>{data.label}</div>
        <div style={{ fontSize: '0.8em' }}>{data.type}</div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default ServiceNode;
