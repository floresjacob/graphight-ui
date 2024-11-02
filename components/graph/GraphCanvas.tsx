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
  Handle,
  Position,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { NodeType } from '@/lib/types/graph';

interface NodeData {
  label: string;
}

// Define the data structure for our nodes
type CustomNodeData = {
    label: string;
  };

// Business Node Component
function BusinessNode({ data }: NodeProps<{ data: CustomNodeData }>) {
    return (
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
        <Handle type="target" position={Position.Top} />
        <div className="font-bold">{data.label}</div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    );
  }
  
// Product Node Component
function ProductNode({ data }: NodeProps<{ data: CustomNodeData }>) {
    return (
      <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-400">
        <Handle type="target" position={Position.Top} />
        <div className="font-bold">{data.label}</div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    );
}
  
  // Map our node types to custom components
  const nodeTypes = {
    business: BusinessNode,
    product: ProductNode,
  };


const initialNodes = [
    {
      id: '1',
      data: { label: 'Apple' },
      position: { x: 250, y: 250 },
      type: 'business',
    },
    {
      id: '2',
      data: { label: 'iPhone' },
      position: { x: 500, y: 250 },
      type: 'product',
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
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
