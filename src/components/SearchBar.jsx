// components/SearchBar.jsx
import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <input
      type="text"
      placeholder="Search nodes..."
      value={searchTerm}
      onChange={handleChange}
      style={{
        width: '100%',
        padding: '8px',
        marginBottom: '20px',
        borderRadius: '4px',
        border: '1px solid #ccc'
      }}
    />
  );
}

export default SearchBar;
