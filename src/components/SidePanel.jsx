// components/SidePanel.jsx
import React from 'react';

function SidePanel({ selectedNode, selectedEdge, onUpdateNode }) {
  if (!selectedNode && !selectedEdge) {
    return (
      <div className="side-panel">
        <h3>No element selected</h3>
        <p>Click on a node or edge to see its details</p>
      </div>
    );
  }

  if (selectedNode) {
    return (
      <div className="side-panel">
        <h3>Node Details</h3>
        <div>
          <strong>Type:</strong> {selectedNode.type}
        </div>
        <div>
          <strong>Label:</strong> {selectedNode.data.label}
        </div>
        {Object.entries(selectedNode.data)
          .filter(([key]) => key !== 'label')
          .map(([key, value]) => (
            <div key={key}>
              <strong>{key}:</strong> {value}
            </div>
          ))}
      </div>
    );
  }

  if (selectedEdge) {
    return (
      <div className="side-panel">
        <h3>Edge Details</h3>
        <div>
          <strong>Type:</strong> {selectedEdge.type}
        </div>
        <div>
          <strong>Source:</strong> {selectedEdge.source}
        </div>
        <div>
          <strong>Target:</strong> {selectedEdge.target}
        </div>
      </div>
    );
  }
}

export default SidePanel;
