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
import { parseSysmap } from './parser/sysmapParser';
import { sysmapToReactFlow, reactFlowToSysmap, extractPositions } from './parser/sysmapConverter';
import PropertyEditor from './components/PropertyEditor';
import NodeCreator from './components/NodeCreator';
import EdgeEditor from './components/EdgeEditor';

// Custom node types
const nodeTypes = {
  business: BusinessNode,
  product: ProductNode,
  service: ServiceNode,
  customer: CustomerNode,
};

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [sysmapText, setSysmapText] = useState('');
  const [parseError, setParseError] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [isSyncingFromGraph, setIsSyncingFromGraph] = useState(false);
  const [parsedConfig, setParsedConfig] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [showNodeCreator, setShowNodeCreator] = useState(false);

  // Load example on mount for testing
  useEffect(() => {
    fetch('/examples/apple.sysmap')
      .then(response => response.text())
      .then(text => {
        setSysmapText(text);
        try {
          const parsed = parseSysmap(text);
          setParsedConfig(parsed.config);
          const positions = extractPositions(text);
          const { nodes: newNodes, edges: newEdges } = sysmapToReactFlow(parsed, 'hierarchical', positions);
          setNodes(newNodes);
          setEdges(newEdges);
          setParseError(null);
        } catch (error) {
          setParseError(error.message);
          console.error('Parse error:', error);
        }
      })
      .catch(error => {
        console.log('No example file found, waiting for user upload');
      });
  }, []);

  // Sync graph changes back to .sysmap text
  const syncGraphToText = useCallback(() => {
    if (nodes.length === 0) return;

    setIsSyncingFromGraph(true);
    const newText = reactFlowToSysmap(nodes, edges, parsedConfig);
    setSysmapText(newText);
    setTimeout(() => setIsSyncingFromGraph(false), 100);
  }, [nodes, edges, parsedConfig]);

  // Sync text changes to graph with debouncing
  const syncTextToGraph = useCallback((text) => {
    if (isSyncingFromGraph) return; // Don't re-parse if we just updated from graph

    try {
      const parsed = parseSysmap(text);
      setParsedConfig(parsed.config);
      const positions = extractPositions(text);
      const { nodes: newNodes, edges: newEdges } = sysmapToReactFlow(parsed, 'hierarchical', positions);
      setNodes(newNodes);
      setEdges(newEdges);
      setParseError(null);
    } catch (error) {
      setParseError(error.message);
    }
  }, [isSyncingFromGraph]);

  // Debounced text-to-graph sync
  useEffect(() => {
    if (!sysmapText || isSyncingFromGraph) return;

    const timeoutId = setTimeout(() => {
      syncTextToGraph(sysmapText);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [sysmapText, syncTextToGraph, isSyncingFromGraph]);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setSysmapText(text);
        try {
          const parsed = parseSysmap(text);
          setParsedConfig(parsed.config);
          const positions = extractPositions(text);
          const { nodes: newNodes, edges: newEdges } = sysmapToReactFlow(parsed, 'hierarchical', positions);
          setNodes(newNodes);
          setEdges(newEdges);
          setParseError(null);
        } catch (error) {
          setParseError(error.message);
          console.error('Parse error:', error);
        }
      }
    };
    reader.readAsText(file);
  }, []);

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
      if (newWidth >= 250 && newWidth <= 800) {
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
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds);

        // Check if any position changes occurred
        const hasPositionChange = changes.some(
          change => change.type === 'position' && change.dragging === false
        );

        // Sync to text after position change completes
        if (hasPositionChange) {
          setTimeout(() => {
            const newText = reactFlowToSysmap(updated, edges, parsedConfig);
            setIsSyncingFromGraph(true);
            setSysmapText(newText);
            setTimeout(() => setIsSyncingFromGraph(false), 100);
          }, 0);
        }

        return updated;
      });
    },
    [edges, parsedConfig]
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => {
        const updated = applyEdgeChanges(changes, eds);
        // Sync after edge changes
        setTimeout(() => syncGraphToText(), 0);
        return updated;
      });
    },
    [syncGraphToText]
  );

  // Handle new connections (when user drags from node to node)
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        // Create edge with proper relationship metadata
        const newEdge = {
          ...params,
          id: `e-${params.source}-${params.target}-${Date.now()}`,
          type: 'smoothstep',
          animated: false,
          label: 'uses', // Default relationship type
          data: {
            relationshipType: 'uses' // Default to 'uses'
          }
        };

        const updated = [...eds, newEdge];

        // Sync after new connection
        setTimeout(() => {
          const newText = reactFlowToSysmap(nodes, updated, parsedConfig);
          setIsSyncingFromGraph(true);
          setSysmapText(newText);
          setTimeout(() => setIsSyncingFromGraph(false), 100);
        }, 0);

        // Auto-select the new edge for editing
        setTimeout(() => setSelectedEdge(newEdge), 10);

        return updated;
      });
    },
    [nodes, parsedConfig]
  );

  // Handle textarea changes
  const handleTextChange = useCallback((event) => {
    setSysmapText(event.target.value);
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Handle edge click
  const handleEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setShowNodeCreator(false);
  }, []);

  // Handle pane click (deselect)
  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // Handle node update from PropertyEditor
  const handleNodeUpdate = useCallback((updatedNode) => {
    setNodes((nds) => {
      const updated = nds.map(n => n.id === updatedNode.id ? updatedNode : n);

      // Sync to text immediately
      setTimeout(() => {
        const newText = reactFlowToSysmap(updated, edges, parsedConfig);
        setIsSyncingFromGraph(true);
        setSysmapText(newText);
        setTimeout(() => setIsSyncingFromGraph(false), 100);
      }, 0);

      return updated;
    });

    // Update selected node to reflect changes
    setSelectedNode(updatedNode);
  }, [edges, parsedConfig]);

  // Handle node delete
  const handleNodeDelete = useCallback((nodeId) => {
    setNodes((nds) => {
      const updated = nds.filter(n => n.id !== nodeId);

      // Also remove connected edges
      setEdges((eds) => {
        const updatedEdges = eds.filter(e => e.source !== nodeId && e.target !== nodeId);

        // Sync to text
        setTimeout(() => {
          const newText = reactFlowToSysmap(updated, updatedEdges, parsedConfig);
          setIsSyncingFromGraph(true);
          setSysmapText(newText);
          setTimeout(() => setIsSyncingFromGraph(false), 100);
        }, 0);

        return updatedEdges;
      });

      return updated;
    });

    setSelectedNode(null);
  }, [edges, parsedConfig]);

  // Handle edge update from EdgeEditor
  const handleEdgeUpdate = useCallback((updatedEdge) => {
    setEdges((eds) => {
      const updated = eds.map(e => e.id === updatedEdge.id ? updatedEdge : e);

      // Sync to text immediately
      setTimeout(() => {
        const newText = reactFlowToSysmap(nodes, updated, parsedConfig);
        setIsSyncingFromGraph(true);
        setSysmapText(newText);
        setTimeout(() => setIsSyncingFromGraph(false), 100);
      }, 0);

      return updated;
    });

    // Update selected edge to reflect changes
    setSelectedEdge(updatedEdge);
  }, [nodes, parsedConfig]);

  // Handle edge delete
  const handleEdgeDelete = useCallback((edgeId) => {
    setEdges((eds) => {
      const updated = eds.filter(e => e.id !== edgeId);

      // Sync to text
      setTimeout(() => {
        const newText = reactFlowToSysmap(nodes, updated, parsedConfig);
        setIsSyncingFromGraph(true);
        setSysmapText(newText);
        setTimeout(() => setIsSyncingFromGraph(false), 100);
      }, 0);

      return updated;
    });

    setSelectedEdge(null);
  }, [nodes, parsedConfig]);

  // Handle node creation
  const handleCreateNode = useCallback(({ id, type, label }) => {
    // Calculate position - find the center of visible area or use default
    const position = {
      x: Math.random() * 300 + 100,
      y: Math.random() * 300 + 100
    };

    const newNode = {
      id,
      type,
      position,
      data: { label }
    };

    setNodes((nds) => {
      const updated = [...nds, newNode];

      // Sync to text
      setTimeout(() => {
        const newText = reactFlowToSysmap(updated, edges, parsedConfig);
        setIsSyncingFromGraph(true);
        setSysmapText(newText);
        setTimeout(() => setIsSyncingFromGraph(false), 100);
      }, 0);

      return updated;
    });

    // Close creator and select the new node
    setShowNodeCreator(false);
    setSelectedNode(newNode);
  }, [edges, parsedConfig]);

  // Handle ESC key to deselect/close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedNode(null);
        setSelectedEdge(null);
        setShowNodeCreator(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', userSelect: isResizing ? 'none' : 'auto' }}>
      {/* Sidebar with .sysmap content */}
      <div
        style={{
          width: `${sidebarWidth}px`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: '15px',
          boxSizing: 'border-box'
        }}
      >
        <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold' }}>
          System Map
        </h2>

        {/* File upload button and Create Node button */}
        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
          <input
            type="file"
            accept=".sysmap"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="sysmap-upload"
          />
          <label
            htmlFor="sysmap-upload"
            style={{
              flex: 1,
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'center'
            }}
          >
            Load File
          </label>
          <button
            onClick={() => {
              setShowNodeCreator(!showNodeCreator);
              setSelectedNode(null);
            }}
            style={{
              flex: 1,
              padding: '10px 20px',
              backgroundColor: showNodeCreator ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {showNodeCreator ? 'Cancel' : '+ Node'}
          </button>
        </div>

        {/* Parse error display */}
        {parseError && (
          <div
            style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              color: '#721c24',
              fontSize: '12px'
            }}
          >
            <strong>Parse Error:</strong>
            <pre style={{ margin: '5px 0 0 0', whiteSpace: 'pre-wrap' }}>{parseError}</pre>
          </div>
        )}

        {/* Stats display */}
        {nodes.length > 0 && (
          <div
            style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#155724'
            }}
          >
            <strong>Loaded:</strong> {nodes.length} nodes, {edges.length} edges
          </div>
        )}

        {/* Node Creator (if shown) */}
        {showNodeCreator && (
          <NodeCreator
            onCreateNode={handleCreateNode}
            onClose={() => setShowNodeCreator(false)}
            existingNodes={nodes}
          />
        )}

        {/* Property Editor (if node selected) */}
        {selectedNode && !showNodeCreator && !selectedEdge && (
          <PropertyEditor
            node={selectedNode}
            onUpdate={handleNodeUpdate}
            onDelete={handleNodeDelete}
            onClose={() => setSelectedNode(null)}
          />
        )}

        {/* Edge Editor (if edge selected) */}
        {selectedEdge && !showNodeCreator && (
          <EdgeEditor
            edge={selectedEdge}
            nodes={nodes}
            onUpdate={handleEdgeUpdate}
            onDelete={handleEdgeDelete}
            onClose={() => setSelectedEdge(null)}
          />
        )}

        {/* Raw .sysmap text display */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <label
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '5px',
              color: '#495057'
            }}
          >
            .sysmap Content:
          </label>
          <textarea
            value={sysmapText}
            onChange={handleTextChange}
            style={{
              flex: 1,
              width: '100%',
              padding: '10px',
              fontFamily: 'monospace',
              fontSize: '11px',
              border: parseError ? '1px solid #dc3545' : '1px solid #ced4da',
              borderRadius: '4px',
              resize: 'none',
              backgroundColor: '#ffffff',
              color: '#000000',
              boxSizing: 'border-box'
            }}
            placeholder="Load a .sysmap file or type your system map here..."
          />
        </div>
      </div>

      {/* Resize handle */}
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

      {/* Main canvas */}
      <div style={{
        width: `calc(100% - ${sidebarWidth}px - 5px)`,
        height: '100%'
      }}>
        <ReactFlow
          nodes={nodes.map(node => ({
            ...node,
            style: {
              ...node.style,
              ...(selectedNode?.id === node.id ? {
                border: '3px solid #007bff',
                boxShadow: '0 0 10px rgba(0, 123, 255, 0.5)'
              } : {})
            }
          }))}
          edges={edges.map(edge => ({
            ...edge,
            style: {
              ...edge.style,
              ...(selectedEdge?.id === edge.id ? {
                stroke: '#7B1FA2',
                strokeWidth: 3
              } : {})
            }
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          onPaneClick={handlePaneClick}
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