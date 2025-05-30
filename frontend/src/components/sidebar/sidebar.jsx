import { useState, useEffect } from "react";
import { Menu, Folder ,ShoppingBasket,ShoppingCart,User } from "lucide-react";
import axios from "axios";
import CategoryNode from "../category list/categoryNode";
import Login from "../login/login";
import NewOrderSection from "./newOrderSection.jsx/newOrder";
import Api from "../../utils/AxiosInstance";
import fetchBasket from "../../fetch/fetchBasket";
import OrdersList from "./ordersList";
export default function Sidebar({ onSelectCategory, basketItems, setBasketItems }) {
  const [openSection, setOpenSection] = useState("account");
  const [categories, setCategories] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      setIsLoggedIn(true);
    }

    axios.get("http://127.0.0.1:8000/api/categories/")
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const toggleSection = (section) => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  return (
    <div className="flex h-full bg-gray-900 text-white">
      {/* Left Icon Buttons */}
      <div className="flex flex-col justify-between items-center p-2 bg-gray-800">
        <div className="flex flex-col space-y-4">
          <button onClick={() => toggleSection("account")} className={`p-2 rounded ${openSection === "account" ? "bg-gray-600" : "hover:bg-gray-700"}`}>
            <User size={24} />
          </button>

          <button onClick={() => toggleSection("categories")} className={`p-2 rounded ${openSection === "categories" ? "bg-gray-600" : "hover:bg-gray-700"}`}>
            <Folder size={24} />
          </button>

          <button onClick={() => toggleSection("orders")} className={`p-2 rounded ${openSection === "orders" ? "bg-gray-600" : "hover:bg-gray-700"}`}>
            <ShoppingBasket size={24} />
          </button>

          <button onClick={() => toggleSection("new_order")} className={`p-2 rounded ${openSection === "new_order" ? "bg-gray-600" : "hover:bg-gray-700"}`}>
            <ShoppingCart size={24} />
          </button>
        </div>
      </div>

      {/* Right Side Panel */}
      <div className={`w-72 overflow-y-auto transition-all duration-200 p-4 ${openSection ? "block" : "hidden"}`}>
        {openSection === "account" && <Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>}
        {openSection === "categories" && (
          <ul className="space-y-2">
            {categories.map(cat => (
              <CategoryNode key={cat.id} node={cat} onSelectCategory={onSelectCategory} />
            ))}
          </ul>
        )}
        {(openSection === "orders" && isLoggedIn) && <OrdersList />}
        {(openSection === "new_order" && isLoggedIn) && <NewOrderSection basketItems={basketItems} />}
      </div>
    </div>
  );
}