import React from 'react'
import { useState, useEffect } from "react";
import Api from "../../utils/AxiosInstance";	
import getFormattedDate from '../../utils/getFormattedDate';
import { Link } from "react-router-dom";
const   OrdersList = () => {
    const [orders, setOrders] = useState([]);
    useEffect(() => {
        try {
            Api.get("http://127.0.0.1:8000/api/orders/confirmed-orders/")
            .then(res => setOrders(res.data))
            .catch(err => console.error(err));
        }
        catch (err) {
            console.error(err);
        }
    }
    , []);



  return (

    <div className="flex flex-col">

    <div>OrdersList</div>
    <div className="flex flex-col">
      {orders.map(order => (
        <Link key={order.id} to={`/orders/${order.id}`}>
        <div  className="flex justify-between items-center p-2 bg-gray-700 rounded mb-2">
          
          <p>{order.created_at}</p>
          <p>${order.total_price}</p>
          
        </div>
        </Link>
      ))}
    </div>
    </div>
  )
}

export default OrdersList