// lib/hooks/useLayout.ts
import { useEffect } from 'react';
import { Node, useReactFlow, ReactFlowProvider } from '@xyflow/react';

function BaseAutoLayout() {
  const { getNodes, setNodes } = useReactFlow();

  useEffect(() => {
    const nodes = getNodes();
    if (!nodes.length) return;

    // Simple grid layout
    const updatedNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 3) * 200 + 100,
        y: Math.floor(index / 3) * 200 + 100,
      },
    }));

    setNodes(updatedNodes);
  }, [getNodes, setNodes]);
}

export function useAutoLayout() {
  return BaseAutoLayout;
}