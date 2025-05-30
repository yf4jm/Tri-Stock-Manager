import { useState } from "react";
import { Star, StarOff } from "lucide-react";
import no_image from '../../assets/no-image.png';
import Api from '../../utils/AxiosInstance';
import fetchBasket from '../../fetch/fetchBasket';

const ProductItem = ({ data, setBasketItems }) => {
  const [isFavorite, setIsFavorite] = useState(data.is_favorite);
  const [quantity, setQuantity] = useState(data.quantity); // 👈 use local quantity
  const product = data.product;

  const toggleFavorite = async () => {
    try {
      await Api.post(`http://127.0.0.1:8000/api/products/${product.id}/toggle_favorite/`);
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  const handleAddToCart = async () => {
    try {
      await Api.post("http://127.0.0.1:8000/api/orders/add-to-basket/", {
        product_id: product.id,
        quantity: 1,
        price_at_purchase: product.price
      });
      alert("Added to cart!");
      const updatedBasket = await fetchBasket();
      setBasketItems(updatedBasket);
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  const updateQuantity = async (change) => {
    const newQuantity = quantity + change;
    if (newQuantity < 0) return;

    try {
      await Api.patch(`http://127.0.0.1:8000/api/products/${product.id}/update_quantity/`, {
        quantity: newQuantity
      });
      setQuantity(newQuantity); // update local UI
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  return (
    <div className="w-72 bg-gray-200 rounded-lg shadow-md p-5 flex flex-col items-center">
      <button className="text-white px-2 py-2 rounded text-xl w-10" onClick={toggleFavorite}>
        {isFavorite ? (
          <Star size={32} className="text-yellow-500" />
        ) : (
          <StarOff size={32} className="text-gray-400" />
        )}
      </button>

      <img src={product.image || no_image} className="w-36" alt={product.name} />
      <p className="font-bold text-center mt-2">{product.name}</p>
      <p className="font-bold text-center text-gray-600 mt-2">{product.label}</p>

      <div className="p-3 bg-gray-300 rounded-lg mt-2 w-full flex flex-col items-center">
        <p className="text-gray-600">Price: ${product.price}</p>
        <div className="flex items-center gap-2">
          <button
            className="bg-red-500 text-white px-2 rounded text-2xl"
            onClick={() => updateQuantity(-1)}
          >
            -
          </button>
          <p className="text-gray-600 text-2xl">Stock: {quantity}</p>
          <button
            className="bg-blue-500 text-white px-2 rounded text-2xl"
            onClick={() => updateQuantity(1)}
          >
            +
          </button>
        </div>
      </div>

      <a
        target="_blank"
        rel="noopener noreferrer"
        href={product.url_reference}  
        className="mt-2 text-blue-600 underline text-sm"
      >
        Product Link
      </a>

      <button
        className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
        onClick={handleAddToCart}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductItem;
