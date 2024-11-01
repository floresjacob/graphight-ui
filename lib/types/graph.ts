// lib/types/graph.ts

export type NodeType = 'business' | 'product' | 'service' | 'customer';

export interface Node {
  id: string;
  type: NodeType;
  label: string;
  properties: {
    name: string;
    industry?: string;
    location?: string;
    revenue?: number;
    category?: string;
    price?: number;
    releaseDate?: string;
    description?: string;
    [key: string]: any;
  };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: 'produces' | 'partners' | 'competes' | 'supports' | 'purchases' | 'subscribes';
  properties?: {
    strength?: number;
    lastUpdated?: string;
    [key: string]: any;
  };
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}