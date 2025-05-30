import React from 'react';

import ProductItem from '../components/productItem/productItem';
const Products = ({ data, setBasketItems  }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mt-4">Stock</h1>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 mt-4">
        {data.map(item => (
          <ProductItem data={item} key={item.product.id} setBasketItems={setBasketItems }/>
        ))}
      </div>
    </div>
  );
};

export default Products;
