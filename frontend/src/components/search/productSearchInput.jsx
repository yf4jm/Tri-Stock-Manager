// components/search/productSearchInput.js
import { useState } from 'react';
import Api from '../../utils/AxiosInstance'; // Adjust import path as necessary

const ProductSearchInput = ({ onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term === '') {
      onSearchResults(null); // reset to default
      return;
    }

    try {
      const res = await Api.get(`http://127.0.0.1:8000/api/products/search/?q=${term}`);
      onSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={handleSearch}
      placeholder="Search for products..."
      className="border rounded p-2 w-72"
    />
  );
};

export default ProductSearchInput;
