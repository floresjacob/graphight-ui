// lib/store/graph-store.ts
import { create } from 'zustand';
import { Connection } from '@xyflow/react';
import { Node, Edge, GraphData, NodeType, EdgeType } from '../types/graph';

interface GraphStore {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  filters: {
    nodeTypes: NodeType[];
    industries: string[];
    locations: string[];
  };
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  selectNode: (node: Node | null) => void;
  selectEdge: (edge: Edge | null) => void;
  addEdge: (connection: Connection) => void;
  updateFilters: (filters: Partial<GraphStore['filters']>) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  filters: {
    nodeTypes: [],
    industries: [],
    locations: [],
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (node) => set({ selectedNode: node }),
  selectEdge: (edge) => set({ selectedEdge: edge }),
  addEdge: (connection) => set((state) => {
    if (!connection.source || !connection.target) return state;

    const newEdge: Edge = {
      id: `e${connection.source}-${connection.target}-${Date.now()}`,
      source: connection.source,
      target: connection.target,
      type: 'produces',
      properties: {
        strength: 1,
        lastUpdated: new Date().toISOString(),
      },
    };

    return {
      edges: [...state.edges, newEdge]
    };
  }),
  updateFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),
  updateNodePosition: (id, position) => set((state) => ({
    nodes: state.nodes.map((node) => 
      node.id === id 
        ? { ...node, properties: { ...node.properties, position } }
        : node
    ),
  })),
}));