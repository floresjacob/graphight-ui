// lib/store/graph-store.ts

import { create } from 'zustand';
import { Node, Edge, GraphData, NodeType } from '../types/graph';

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
  updateFilters: (filters: Partial<GraphStore['filters']>) => void;
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
  updateFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
}));