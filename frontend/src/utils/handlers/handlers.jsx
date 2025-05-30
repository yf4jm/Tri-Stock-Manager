const handleQuantityChange = (id, delta) => {
    setCart(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = cart[product.id] || 0;
    if (quantity > 0) {
      axios.post('http://127.0.0.1:8000/api/orders/add/', {
        product_id: product.id,
        quantity,
        price: product.price,
      }).then(() => {
        alert(`Added ${quantity} of ${product.name} to cart.`);
        setCart(prev => ({ ...prev, [product.id]: 0 }));
      }).catch(err => console.error(err));
    }
  };