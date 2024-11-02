// lib/types/graph.ts

export type NodeType = 'business' | 'product' | 'service' | 'customer';

export interface NodeProperties {
  name: string;
  industry?: string;
  location?: string;
  revenue?: number;
  category?: string;
  price?: number;
  releaseDate?: string;
  description?: string;
  position?: { x: number; y: number };
  [key: string]: any;
}

export interface Node {
  id: string;
  type: NodeType;
  label: string;
  properties: NodeProperties;
}

export interface EdgeProperties {
  strength?: number;
  lastUpdated?: string;
  [key: string]: any;
}

export type EdgeType = 'produces' | 'partners' | 'competes' | 'supports' | 'purchases' | 'subscribes';

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  properties?: EdgeProperties;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}