"use client";

import { useCart } from "../context/CartContext";

const CartIcon = () => {
  const { cart, isAuthenticated } = useCart();
  
  if (!isAuthenticated) {
    return null; 
  }

  const itemCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);

  return (
    <div className="cart-icon">
      🛒 {itemCount} {itemCount === 1 ? "item" : "items"}
    </div>
  );
};

export default CartIcon;
