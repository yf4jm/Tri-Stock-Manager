import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Api from "../utils/AxiosInstance";
import getFormattedDate from "../utils/getFormattedDate";
import { Link } from "react-router-dom";
const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await Api.get(`http://127.0.0.1:8000/api/orders/${orderId}/`);
        setOrder(response.data);
        console.log (response.data);
      } catch (err) {
        setError("Failed to fetch order details");
        console.error(err);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (error) return <p>{error}</p>;
  if (!order) return <p>Loading...</p>;
  const handleDelete = async () => {
    try {
      Api.delete(`http://127.0.0.1:8000/api/orders/${orderId}/delete/`).then((res) => {
        window.location.href = "/";
      });

    }
    catch (err) {
      console.error(err);
    }
  }
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
        <Link to={'/'} className="w-full bg-blue-500 text-white p-2 rounded-md">Return to products</Link>
      <h2 className="text-xl font-bold my -4">Order #{order.id}</h2>
      <p className="mb-2">Order Date: {getFormattedDate(order.created_at)}</p>
      <p className="mb-4">Total: ${order.total_price
      }</p>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Product</th>
            <th className="p-2 border">Label</th>
            <th className="p-2 border">Quantity</th>
            <th className="p-2 border">Price Purchased At</th>
            <th className="p-2 border">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((data) => (
            <tr key={data.product.id}>
              <td className="p-2 border"><a target="_blank" href={data.product.url_reference} className="underline">{data.product.name}</a></td>
              <td className="p-2 border">{data.product.label}</td>
              <td className="p-2 border">{data.quantity}</td>
              <td className="p-2 border">${data.price_at_purchase}</td>
              <td className="p-2 border">
                ${(data.quantity * data.price_at_purchase)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleDelete}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Delete Order
      </button>
    </div>
  );
};

export default OrderDetail;
