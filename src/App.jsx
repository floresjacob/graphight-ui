// App.jsx
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import BusinessNode from './components/BusinessNode';
import ProductNode from './components/ProductNode';
import ServiceNode from './components/ServiceNode';
import CustomerNode from './components/CustomerNode';
import SidePanel from './components/SidePanel';
import SearchBar from './components/SearchBar';
import { initialNodes, initialEdges } from './data/sampleData';

// Custom node types
const nodeTypes = {
  business: BusinessNode,
  product: ProductNode,
  service: ServiceNode,
  customer: CustomerNode,
};

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  // Handle node changes (position, selection)
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // Handle new connections
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Filter nodes by search term
  const handleSearch = (searchTerm) => {
    const filteredNodes = nodes.map(node => ({
      ...node,
      hidden: !node.data.label.toLowerCase().includes(searchTerm.toLowerCase())
    }));
    setNodes(filteredNodes);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <div style={{ width: '20%', padding: '20px', borderRight: '1px solid #ccc' }}>
        <SearchBar onSearch={handleSearch} />
        <SidePanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onUpdateNode={(updatedNode) => {
            setNodes(nodes.map(node => 
              node.id === updatedNode.id ? updatedNode : node
            ));
          }}
        />
      </div>
      <div style={{ width: '80%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;