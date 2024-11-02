// components/graph/MinimalTest.tsx
'use client';

import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  {
    id: '1',
    data: { label: 'Apple' },
    position: { x: 250, y: 250 },
    type: 'default',
  },
  {
    id: '2',
    data: { label: 'iPhone' },
    position: { x: 500, y: 250 },
    type: 'default',
  },
];

const initialEdges = [];

export function MinimalTest() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  return (
    <div className="w-full h-[800px]">
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
      <div className="absolute top-2 right-2 bg-white p-2 rounded shadow">
        <p>Nodes: {nodes.length}</p>
        <p>Edges: {edges.length}</p>
      </div>
    </div>
  );
}