// // app/explore/page.tsx
'use client';

import { GraphCanvas } from '@/components/graph/GraphCanvas';
import { useGraphStore } from '@/lib/store/graph-store';
import { useEffect } from 'react';

// Sample data for testing
const sampleData = {
  nodes: [
    {
      id: '1',
      type: 'business' as const,
      label: 'Apple',
      properties: {
        name: 'Apple Inc.',
        industry: 'Technology',
        location: 'Cupertino, CA',
        revenue: 365.8,
        position: { x: 250, y: 250 },
      },
    },
    {
      id: '2',
      type: 'product' as const,
      label: 'iPhone',
      properties: {
        name: 'iPhone',
        category: 'Smartphone',
        price: 999,
        releaseDate: '2023-09',
        position: { x: 500, y: 250 },
      },
    },
  ],
  edges: [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'produces' as const,
      properties: {
        strength: 1,
        lastUpdated: '2024-10-31',
      },
    },
  ],
};

export default function Page() {
  const { setNodes, setEdges, nodes, edges } = useGraphStore();

  // Initialize store with sample data only once
  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) {
      setNodes(sampleData.nodes);
      setEdges(sampleData.edges);
    }
  }, [setNodes, setEdges, nodes.length, edges.length]);

  return (
    <div className="p-4">
      <div className="mb-4 p-4 bg-slate-100 rounded-lg">
        <h1 className="text-lg font-bold mb-2">Debug Info</h1>
        <p>Nodes in store: {nodes.length}</p>
        <p>Edges in store: {edges.length}</p>
      </div>
      <GraphCanvas />
    </div>
  );
}

//// app/explore/page.tsx
// 'use client';

// import { MinimalTest } from '@/components/graph/MinimalTest';

// export default function Page() {
//   return (
//     <div className="p-4">
//       <h1 className="text-lg font-bold mb-4">Minimal Test</h1>
//       <MinimalTest />
//     </div>
//   );
// }