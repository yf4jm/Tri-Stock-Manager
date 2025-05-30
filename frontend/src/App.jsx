import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import Sidebar from './components/sidebar/sidebar';
import fetchAllProducts from './fetch/fetchAllProducts';
import fetchBasket from './fetch/fetchBasket';
import ProductSearchInput from './components/search/productSearchInput';
import Products from './pages/products';
import OrderDetail from './pages/orderDetail';
import Api from './utils/AxiosInstance';

function App() {
  const [products, setProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("All products");
  const [basketItems, setBasketItems] = useState({ items: [] });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    setIsLoggedIn(!!accessToken);

    const fetchData = async () => {
      if (!accessToken) return;
      try {
        const [productData, basketData] = await Promise.all([
          fetchAllProducts(),
          fetchBasket()
        ]);
        setProducts(productData);
        setBasketItems(basketData);
      } catch (err) {
        console.error("Data fetching failed", err);
      }
    };

    fetchData();
  }, [isLoggedIn]);

  const handleSelectCategory = (category) => {
    setCurrentCategory(category.name);
    Api.get(`http://127.0.0.1:8000/api/categories/${category.id}/products/`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  };

  const fetchProducts = async () => {
    try {
      const res = await fetchAllProducts();
      setProducts(res);
      setCurrentCategory("All products");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Router>
      <div className="flex min-h-screen">
        {/* Sidebar on the left */}
        <aside className="bg-gray-100 p-4 sticky top-0 self-start h-screen overflow-none">
          <Sidebar
            onSelectCategory={handleSelectCategory}
            basketItems={basketItems}
            setBasketItems={setBasketItems}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-5">
          <Routes>
            <Route path="/" element={
              <>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-5'>
                    <p>Search</p>
                    <ProductSearchInput onSearchResults={(results) => {
                      if (results === null) {
                        fetchAllProducts().then(setProducts);
                      } else {
                        setProducts(results);
                      }
                    }} />
                    <button onClick={fetchProducts} className='mt-2 bg-green-600 text-white px-4 py-2 rounded cursor-pointer'>
                      all products
                    </button>
                  </div>
                </div>

                <p className="text-gray-500">
                  Category: <span className="font-bold">{currentCategory}</span>
                </p>

                <Products
                  data={products}
                  setBasketItems={setBasketItems}
                />
              </>
            } />

            {/* Define a route for viewing an order */}
            <Route path="/orders/:orderId" element={<OrderDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
