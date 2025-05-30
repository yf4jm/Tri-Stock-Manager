
import axios from "axios";
import Api from "../utils/AxiosInstance";
  const fetchAllProducts = async () => {
      try{
          const res = await Api.get('http://127.0.0.1:8000/api/user/products/')
           return res.data
  
      }catch(error){
          console.error(error);
          
      }
  
  }
  
  export default fetchAllProducts