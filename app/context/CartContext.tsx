"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './authprovider';
import { useRouter } from 'next/navigation';

interface CartItem {
  compositionId: string;
  title: string;
  artist: string;
  genre: string;
  price: number;
  quantity: number;
  coverImage: string;
  licenseId: string;
  licenseName: string;
  licensePrice: number;
}

interface CartContextType {
  cart: CartItem[];
  isAuthenticated: boolean;
  addToCart: (composition: any) => Promise<void>;
  fetchCart: () => Promise<void>;
  updateCart: (updatedCart: CartItem[]) => Promise<void>;
  selectLicense: (compositionId: string, licenseId: string) => Promise<void>;
  removeFromCart: (compositionId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const isAuthenticated = !!session?.user;

  const removeFromCart = useCallback(async (compositionId) => {
    if (!isAuthenticated) {
      setErrorMessage('You need to be logged in to remove items from the cart.');
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch(`/api/cart?compositionId=${compositionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      const result = await response.json();
      if (result.success) {
        setCart(prevCart => prevCart.filter(item => item.compositionId !== compositionId));
        setErrorMessage('Item removed from cart');
      } else {
        setErrorMessage(result.message || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setErrorMessage('An error occurred while removing the item from the cart.');
    }
    setShowModal(true);
  }, [isAuthenticated]);

  const fetchCart = useCallback(async () => {
    if (isAuthenticated && session?.user?.id) {
      try {
        const response = await fetch('/api/cart', {
          headers: {
            'Authorization': `Bearer ${session.user.id}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }
        const data = await response.json();
        setCart(data.cart || []);
      } catch (error) {
        console.error('Error fetching cart:', error);
        setErrorMessage('Failed to load cart. Please try again.');
      }
    } else {
      setCart([]);
    }
  }, [isAuthenticated, session]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated, fetchCart]);

  const addToCart = useCallback(async (composition: any) => {
    if (!isAuthenticated) {
      setErrorMessage('You need to be logged in to add items to the cart.');
      setShowModal(true);
      return;
    }

    try {
      const existingItems = cart.filter(item => item.compositionId === composition._id);
      if (existingItems.some(item => item.licenseId === composition.licenseId)) {
        setErrorMessage('This license for the composition is already in your cart.');
        setShowModal(true);
        return;
      }

      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.user.id}`,
        },
        body: JSON.stringify({
          userId: session!.user.id,
          compositionId: composition._id,
          licenseId: composition.licenseId,
          licenseName: composition.licenseName,
          licensePrice: composition.licensePrice,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setErrorMessage('Item added to cart');
        await fetchCart();
      } else {
        setErrorMessage(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setErrorMessage('An error occurred while adding to the cart.');
    }
    setShowModal(true);
  }, [isAuthenticated, session, fetchCart, cart]);

  const updateCart = useCallback(async (updatedCart: CartItem[]) => {
    if (!isAuthenticated) {
      setErrorMessage('You need to be logged in to update the cart.');
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.user.id}`,
        },
        body: JSON.stringify({
          userId: session!.user.id,
          cart: updatedCart,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setCart(updatedCart);
        setErrorMessage('Cart updated successfully');
      } else {
        setErrorMessage(result.message || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      setErrorMessage('An error occurred while updating the cart.');
    }
    setShowModal(true);
  }, [isAuthenticated, session]);

  const selectLicense = useCallback(async (compositionId: string, licenseId: string) => {
    const existingItem = cart.find(item => item.compositionId === compositionId && item.licenseId === licenseId);
    if (!existingItem) {
      const updatedCart = [...cart, {
        compositionId,
        licenseId,
        licenseName: 'Selected License Name', 
        licensePrice: 0,
        title: 'Composition Title', 
        artist: 'Artist Name', 
        genre: 'Genre', 
        price: 0, 
        quantity: 1,
        coverImage: 'Image URL', 
      }];
      await updateCart(updatedCart);
    }
  }, [cart, updateCart]);

  const handleCloseModal = useCallback(() => setShowModal(false), []);

  const contextValue = React.useMemo(() => ({
    cart,
    isAuthenticated,
    addToCart,
    fetchCart,
    updateCart,
    selectLicense,
    removeFromCart
  }), [cart, isAuthenticated, addToCart, fetchCart, updateCart, selectLicense, removeFromCart]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={handleCloseModal}
        >
          <div
            className="bg-[#1F2937] p-8 rounded-lg shadow-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-[#FFFFFF] mb-4">Cart Update</h2>
            <p className="text-[#D1D5DB] mb-6">{errorMessage}</p>
            <div className="flex gap-4">
              <button
                onClick={handleCloseModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-[#FFFFFF] py-2 px-4 rounded-lg shadow-md hover:bg-[#2563EB] transition duration-300"
              >
                Close
              </button>
              {!isAuthenticated && (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-[#374151] text-[#FFFFFF] py-2 px-4 rounded-lg shadow-md hover:bg-[#4B5563] transition duration-300"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => router.push('/register')}
                    className="bg-[#374151] text-[#FFFFFF] py-2 px-4 rounded-lg shadow-md hover:bg-[#4B5563] transition duration-300"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
