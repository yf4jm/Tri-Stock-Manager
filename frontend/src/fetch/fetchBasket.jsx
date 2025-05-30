import React from 'react'
import Api from '../utils/AxiosInstance';
const fetchBasket =async () => {
    try {
        const res = await Api.get("http://127.0.0.1:8000/api/orders/basket/");
        return res.data;
      } catch (err) {
        console.error(err);
      }
}

export default fetchBasket