// utils/dataUtils.js
export const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  export const saveDataToFile = async (nodes, edges) => {
    const data = {
      nodes,
      edges
    };
  
    try {
      const response = await fetch('/api/saveData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save data');
      }
  
      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  