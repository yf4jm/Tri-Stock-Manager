import React, { useState, useEffect } from "react";
import Api from "../../../utils/AxiosInstance";

const NewOrderSection = ({ basketItems}) => {
  const [orderItems, setOrderItems] = useState({ items: [] });
  const [inputStates, setInputStates] = useState({});

  useEffect(() => {
    const fetchBasket = async () => {
      try {
        const response = await Api.get("http://127.0.0.1:8000/api/orders/basket/");
        const newBasket = response.data;
        setOrderItems(newBasket);
        const inputs = {};
        (newBasket.items || []).forEach((item) => {
          inputs[item.id] = {
            quantity: item.quantity,
            price: item.price_at_purchase,
          };
        });
        setInputStates(inputs);
      } catch (error) {
        console.error("Failed to fetch basket:", error);
      }
    };
  
      fetchBasket();
    
  }, [basketItems]);

  const handleUpdateItem = async (orderItemId, quantity, price) => {
    if (quantity < 0 || price < 0) {
      console.error("Invalid quantity or price");
      return;
    }
    try {
      const response = await Api.post("http://127.0.0.1:8000/api/orders/update-basket-item/", {
        order_item_id: orderItemId,
        quantity: Number(quantity),
        price: parseFloat(price),
      });
      console.log(response.data.message);
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDeleteItem = async (orderItemId) => {
    try {
      const response = await Api.post("http://127.0.0.1:8000/api/orders/delete-from-basket/", {
        order_item_id: orderItemId,
      });
      console.log(response.data);
      setOrderItems((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== orderItemId),
      }));
      setInputStates((prev) => {
        const newState = { ...prev };
        delete newState[orderItemId];
        return newState;
      });
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleConfirmOrder = async () => {
    try {
      const response = await Api.post("http://127.0.0.1:8000/api/orders/confirm-order/");
      setOrderItems({ items: [] });
      setInputStates({});
      console.log("Order confirmed", response.data);
    } catch (err) {
      console.error("Error confirming order:", err);
    }
  };

  const handleInputChange = (e, itemId, field) => {
    const value = e.target.value;
    setInputStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const handleBlur = (itemId) => {
    const { quantity, price } = inputStates[itemId];
    handleUpdateItem(itemId, quantity, price);
  };

  return (
    <div>
      <p>Basket</p>
      <div className="flex flex-col">
        <ul>
          {orderItems.items?.length === 0 && (
            <li className="flex flex-col justify-center items-center p-2 bg-gray-700 rounded mb-2">
              <p>No items in the basket</p>
            </li>
          )}
          {(orderItems.items || []).map((item) => (
            <li
              key={item.id}
              className="flex flex-col justify-between items-center p-2 bg-gray-700 rounded mb-2"
            >
              <p>{item.product}</p>
              <div className="flex flex-col justify-between items-center">
                <div className="flex items-center gap-2">
                  <p>Quantity:</p>
                  <input
                    type="number"
                    name="quantity"
                    value={inputStates[item.id]?.quantity ?? ""}
                    className="w-12 text-center"
                    min={1}
                    onChange={(e) => handleInputChange(e, item.id, "quantity")}
                    onBlur={() => handleBlur(item.id)}
                  />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p>Price: $</p>
                  <input
                    type="number"
                    name="price"
                    value={inputStates[item.id]?.price ?? ""}
                    className="w-12 text-center"
                    onChange={(e) => handleInputChange(e, item.id, "price")}
                    onBlur={() => handleBlur(item.id)}
                  />
                </div>
                <button
                  className="mt-2 bg-red-500 text-white p-2 rounded-md"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        {orderItems.items?.length > 0 && (
          <button
            onClick={handleConfirmOrder}
            className="w-full bg-blue-500 text-white p-2 rounded-md mt-4"
          >
            Confirm Order
          </button>
        )}
      </div>
    </div>
  );
};

export default NewOrderSection;
