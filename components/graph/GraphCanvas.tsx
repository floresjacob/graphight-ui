// components/graph/SimplifiedGraphCanvas.tsx
'use client';

import { useState, useCallback } from 'react';
import {
  Background,
  Controls,
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface NodeData {
  label: string;
}

interface CustomNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
}

interface CustomEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}


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

const initialEdges: CustomEdge[] = [];

export function GraphCanvas() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    []
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
    </div>
  );
}
