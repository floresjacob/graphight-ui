// components/graph/GraphCanvas.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '@/lib/store/graph-store';
import { Node, Edge, NodeType } from '@/lib/types/graph';
import { Button } from '@/components/ui/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/shadcn/dialog';
import { Input } from '@/components/ui/shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { Label } from '@/components/ui/shadcn/label';

type NodeComponentProps = NodeProps<{
  label: string;
  type: NodeType;
  properties: Node['properties'];
}>;

function BusinessNode({ data }: NodeComponentProps) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col">
        <div className="font-bold">{data.label}</div>
        {data.properties.industry && (
          <div className="text-xs text-gray-500">{data.properties.industry}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

function ProductNode({ data }: NodeComponentProps) {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-400">
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col">
        <div className="font-bold">{data.label}</div>
        {data.properties.category && (
          <div className="text-xs text-gray-500">{data.properties.category}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = {
  business: BusinessNode,
  product: ProductNode,
  service: BusinessNode,
  customer: BusinessNode,
};

function NodeCreationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '' as NodeType,
    label: '',
    industry: '',
    category: '',
  });
  
  const { nodes, setNodes } = useGraphStore();

  const handleSubmit = useCallback(() => {
    const newNode: Node = {
      id: `node-${nodes.length + 1}`,
      type: formData.type,
      label: formData.label,
      properties: {
        name: formData.label,
        position: { x: 100 + (Math.random() * 400), y: 100 + (Math.random() * 200) },
        ...(formData.type === 'business' && { industry: formData.industry }),
        ...(formData.type === 'product' && { category: formData.category }),
      },
    };

    setNodes([...nodes, newNode]);
    setIsOpen(false);
    setFormData({ type: '' as NodeType, label: '', industry: '', category: '' });
  }, [nodes, setNodes, formData]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Node</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Node</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: NodeType) => 
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select node type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Label</Label>
            <Input
              value={formData.label}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, label: e.target.value }))
              }
              placeholder="Enter node label"
            />
          </div>

          {formData.type === 'business' && (
            <div className="grid gap-2">
              <Label>Industry</Label>
              <Input
                value={formData.industry}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, industry: e.target.value }))
                }
                placeholder="Enter industry"
              />
            </div>
          )}

          {formData.type === 'product' && (
            <div className="grid gap-2">
              <Label>Category</Label>
              <Input
                value={formData.category}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, category: e.target.value }))
                }
                placeholder="Enter category"
              />
            </div>
          )}

          <Button onClick={handleSubmit}>Create Node</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GraphCanvas() {
  const { nodes: storeNodes, edges: storeEdges, updateNodePosition } = useGraphStore();
  
  const [nodes, setNodes] = useState(storeNodes.map(node => ({
    id: node.id,
    type: node.type,
    data: { 
      label: node.label, 
      type: node.type,
      properties: node.properties 
    },
    position: node.properties.position || { x: 0, y: 0 },
  })));

  const [edges, setEdges] = useState(storeEdges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: 'default',
    animated: true,
    label: edge.type,
    markerEnd: { type: MarkerType.ArrowClosed },
  })));

  useEffect(() => {
    setNodes(
      storeNodes.map(node => ({
        id: node.id,
        type: node.type,
        data: { 
          label: node.label, 
          type: node.type,
          properties: node.properties 
        },
        position: node.properties.position || { x: 0, y: 0 },
      }))
    );
  }, [storeNodes]);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      const updatedNodes = applyNodeChanges(changes, nds);
      changes.forEach((change: any) => {
        if (change.type === 'position' && 'position' in change) {
          updateNodePosition(change.id, change.position);
        }
      });
      return updatedNodes;
    });
  }, [updateNodePosition]);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  return (
    <div className="w-full h-[800px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <Panel position="top-left">
          <NodeCreationDialog />
        </Panel>
      </ReactFlow>
    </div>
  );
}