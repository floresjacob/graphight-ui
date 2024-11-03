let graphData = {
  nodes: [
    {
      id: '1',
      type: 'business',
      position: { x: 0, y: 0 },
      data: { 
        label: 'Apple Inc.',
        industry: 'Technology',
        location: 'Cupertino, CA',
        revenue: '365.8B'
      }
    },
    {
      id: '2',
      type: 'product',
      position: { x: 250, y: -50 },
      data: { 
        label: 'iPhone',
        category: 'Smartphone',
        price: 999,
        releaseDate: '2023-09'
      }
    },
    {
      id: '3',
      type: 'service',
      position: { x: 250, y: 50 },
      data: { 
        label: 'iCloud',
        type: 'Cloud Storage',
        subscription: true,
        monthlyFee: 9.99
      }
    },
    {
      id: '4',
      type: 'customer',
      position: { x: 500, y: 0 },
      data: { 
        label: 'Enterprise Corp',
        type: 'B2B',
        location: 'New York, NY'
      }
    }
  ],

  edges: [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
      type: 'smoothstep',
      label: 'produces',
      animated: true
    },
    {
      id: 'e1-3',
      source: '1',
      target: '3',
      type: 'smoothstep',
      label: 'provides',
      animated: true
    },
    {
      id: 'e2-4',
      source: '2',
      target: '4',
      type: 'smoothstep',
      label: 'purchased by'
    },
    {
      id: 'e3-4',
      source: '3',
      target: '4',
      type: 'smoothstep',
      label: 'subscribed by'
    }
  ]
};

export const getGraphData = () => graphData;

export const updateGraphData = (newNodes, newEdges) => {
  graphData = {
    nodes: newNodes,
    edges: newEdges
  };
  // Also save to localStorage as backup
  localStorage.setItem('graphData', JSON.stringify(graphData));
};