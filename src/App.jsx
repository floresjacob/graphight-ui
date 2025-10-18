// App.jsx
import React, { useState, useCallback, useEffect } from 'react';
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
import { getGraphData, updateGraphData } from './data/sampleData';
import NodeCreator from './components/NodeCreator';

// Custom node types
const nodeTypes = {
  business: BusinessNode,
  product: ProductNode,
  service: ServiceNode,
  customer: CustomerNode,
};

function App() {
  const [nodes, setNodes] = useState(() => {
    const savedData = localStorage.getItem('graphData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData.nodes;
    }
    return getGraphData().nodes;
  });
  const [edges, setEdges] = useState(() => {
    const savedData = localStorage.getItem('graphData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData.edges;
    }
    return getGraphData().edges;
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);

  // Handle sidebar resizing
  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Handle node changes (position, selection)
  const onNodesChange = useCallback(
    (changes) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      setNodes(updatedNodes);
      
      // If a node is deleted, remove its associated edges
      const updatedEdges = changes.reduce((acc, change) => {
        if (change.type === 'remove') {
          return acc.filter(edge => 
            edge.source !== change.id && edge.target !== change.id
          );
        }
        return acc;
      }, edges);
      
      setEdges(updatedEdges);
      updateGraphData(updatedNodes, updatedEdges);
    },
    [nodes, edges]
  );
  

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      setEdges(updatedEdges);
      updateGraphData(nodes, updatedEdges);
    },
    [nodes, edges]
  );

  const onConnect = useCallback(
    (params) => {
      const updatedEdges = addEdge(params, edges);
      setEdges(updatedEdges);
      saveDataToFile(nodes, updatedEdges);
    },
    [nodes, edges]
  );

  const handleAddNode = useCallback((newNode) => {
    setNodes(prev => {
      const updatedNodes = [...prev, newNode];
      updateGraphData(updatedNodes, edges);
      return updatedNodes;
    });
  }, [edges]);

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

  // Optional: Export data feature
  const handleExportData = () => {
    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'graph-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter nodes by search term
  const handleSearch = (searchTerm) => {
    const filteredNodes = nodes.map(node => ({
      ...node,
      hidden: !node.data.label.toLowerCase().includes(searchTerm.toLowerCase())
    }));
    setNodes(filteredNodes);
  };

  //export button to your UI
  const ExportButton = () => (
    <button
      onClick={handleExportData}
      style={{
        padding: '8px 16px',
        margin: '10px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Export Graph Data
    </button>
  );

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', userSelect: isResizing ? 'none' : 'auto' }}>
      <div
        style={{
          width: `${sidebarWidth}px`,
          height: '100%',
          overflow: 'auto',
          position: 'relative',
          padding: '10px',
          boxSizing: 'border-box'
        }}
      >
        <NodeCreator onAddNode={handleAddNode} nodes={nodes} />
        <ExportButton />
        <SearchBar onSearch={handleSearch} />
        <SidePanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onUpdateNode={(updatedNode) => {
            const updatedNodes = nodes.map(node =>
              node.id === updatedNode.id ? updatedNode : node
            );
            setNodes(updatedNodes);
            updateGraphData(updatedNodes, edges);
          }}
        />
      </div>
      <div
        onMouseDown={handleMouseDown}
        style={{
          width: '5px',
          cursor: 'col-resize',
          backgroundColor: isResizing ? '#007bff' : '#ccc',
          transition: 'background-color 0.2s ease',
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '40px',
            backgroundColor: isResizing ? '#007bff' : '#888',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '10px',
            pointerEvents: 'none'
          }}
        >
          ⋮
        </div>
      </div>
      <div style={{
        width: `calc(100% - ${sidebarWidth}px - 5px)`,
        height: '100%'
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNode(node)}
          onEdgeClick={(_, edge) => setSelectedEdge(edge)}
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