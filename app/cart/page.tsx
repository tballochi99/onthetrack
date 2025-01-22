"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authprovider";
import { useCart } from "../context/CartContext";
import { ShoppingCart, Loader2, AlertCircle, Music, User, DollarSign, Trash2 } from "lucide-react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface License {
  licenseId: string;
  licensePrice: number;
}

interface CartItem {
  compositionId: string;
  title: string;
  artist: string;
  genre: string;
  price: number;
  coverImage: string;
  licenseId: string;
  licensePrice: number;
}

interface GroupedCartItem {
  compositionId: string;
  title: string;
  artist: string;
  genre: string;
  coverImage: string;
  licenses: License[];
  selectedLicenseId: string;
}

interface CheckoutItem {
  compositionId: string;
  title: string;
  selectedLicenseId: string;
  licensePrice: number;
  coverImage: string;
}

const CartPage = () => {
  const { session } = useAuth();
  const { cart, fetchCart, selectLicense, removeFromCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedCart, setGroupedCart] = useState<GroupedCartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      if (session?.user) {
        try {
          await fetchCart();
          setLoading(false);
        } catch (err) {
          console.error("Error in loadCart:", err);
          setError("Failed to load cart. Please try again.");
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    loadCart();
  }, [session, fetchCart]);

  useEffect(() => {
    const groupCartItems = (cartItems: CartItem[]) => {
      const grouped = cartItems.reduce<GroupedCartItem[]>((acc, item) => {
        const existingItem = acc.find(i => i.compositionId === item.compositionId);
        if (existingItem) {
          if (!existingItem.licenses.some(l => l.licenseId === item.licenseId)) {
            existingItem.licenses.push({
              licenseId: item.licenseId,
              licensePrice: item.licensePrice
            });
          }
        } else {
          acc.push({
            compositionId: item.compositionId,
            title: item.title,
            artist: item.artist,
            genre: item.genre,
            coverImage: item.coverImage,
            licenses: [{
              licenseId: item.licenseId,
              licensePrice: item.licensePrice
            }],
            selectedLicenseId: item.licenseId
          });
        }
        return acc;
      }, []);
      setGroupedCart(grouped);
    };

    if (cart && Array.isArray(cart)) {
      groupCartItems(cart);
    }
  }, [cart]);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Failed to connect with Stripe');

      const checkoutItems: CheckoutItem[] = groupedCart.map(item => ({
        compositionId: item.compositionId,
        title: item.title,
        selectedLicenseId: item.selectedLicenseId,
        licensePrice: item.licenses.find(l => l.licenseId === item.selectedLicenseId)?.licensePrice || 0,
        coverImage: item.coverImage
      }));

      const response = await fetch('/api/purchase/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: checkoutItems,
          userId: session?.user?.id,
        }),
      });

      const { sessionId, error: responseError } = await response.json();

      if (responseError) {
        throw new Error(responseError);
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      console.error('Error in handleCheckout:', err);
      setError('Failed to proceed to checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLicenseSelect = async (compositionId: string, licenseId: string) => {
    try {
      await selectLicense(compositionId, licenseId);
      setGroupedCart(prevGroupedCart =>
        prevGroupedCart.map(item =>
          item.compositionId === compositionId
            ? { ...item, selectedLicenseId: licenseId }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating license:", error);
      setError("Failed to update license. Please try again.");
    }
  };

  const calculateTotal = (): string => {
    return groupedCart.reduce((total, item) => {
      const selectedLicense = item.licenses.find(license => license.licenseId === item.selectedLicenseId);
      return total + (selectedLicense ? selectedLicense.licensePrice : 0);
    }, 0).toFixed(2);
  };

  const handleRemoveItem = async (compositionId: string) => {
    try {
      await removeFromCart(compositionId);
    } catch (error) {
      console.error("Error removing item from cart:", error);
      setError("Failed to remove item from cart. Please try again.");
    }
  };

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
        <ShoppingCart className="w-16 h-16 mb-4 text-emerald-400" />
        <h1 className="text-2xl font-bold mb-2">Cart</h1>
        <p className="text-center">Please log in to view your cart.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
        <Loader2 className="w-16 h-16 mb-4 animate-spin text-emerald-400" />
        <h1 className="text-2xl font-bold mb-2">Cart</h1>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-4">
        <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
        <h1 className="text-2xl font-bold mb-2">Cart</h1>
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center">
          <ShoppingCart className="w-8 h-8 mr-2 text-emerald-400" />
          Your Cart
        </h1>

        {groupedCart.length === 0 ? (
          <p className="text-lg text-gray-400">Your cart is empty.</p>
        ) : (
          <>
            <ul className="space-y-6">
              {groupedCart.map((item) => (
                <li key={item.compositionId} className="bg-gray-800 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:bg-gray-750 relative border border-gray-700 hover:border-emerald-500">
                  <button
                    onClick={() => handleRemoveItem(item.compositionId)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-300 transition-colors duration-300"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <h3 className="text-xl font-semibold mb-2 sm:mb-0 text-emerald-300">{item.title}</h3>
                    <div className="relative w-24 h-24">
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        className="rounded-md shadow-lg object-cover"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <p className="flex items-center text-sm text-gray-400">
                      <User className="w-4 h-4 mr-2 text-emerald-400" />
                      Artist: {item.artist}
                    </p>
                    <p className="flex items-center text-sm text-gray-400">
                      <Music className="w-4 h-4 mr-2 text-emerald-400" />
                      Genre: {item.genre}
                    </p>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Select a license:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.licenses.map(license => (
                        <button
                          key={license.licenseId}
                          onClick={() => handleLicenseSelect(item.compositionId, license.licenseId)}
                          className={`py-2 px-4 rounded-full text-sm font-medium shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                            item.selectedLicenseId === license.licenseId
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500'
                          }`}
                        >
                          License - ${license.licensePrice.toFixed(2)}
                        </button>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
              <p className="text-xl font-semibold flex items-center justify-between">
                <span>Total:</span>
                <span className="text-2xl text-emerald-400">${calculateTotal()}</span>
              </p>
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className={`w-full mt-4 bg-emerald-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-emerald-700 transition duration-300 ease-in-out text-lg font-semibold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 ${
                  isProcessing ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <DollarSign className="w-5 h-5 mr-2" />
                )}
                {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;