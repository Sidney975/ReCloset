import React, { createContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // 🔹 Load cart from localStorage when the app starts
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("CartItems")) || [];
        setCartItems(storedCart);
    }, []);

    // 🔹 Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("CartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    // Function to add item to cart
    const addToCart = (product) => {
        setCartItems((prevCart) => {
            const existingItem = prevCart.find(item => item.productId === product.productId);

            if (!existingItem) {
                return [...prevCart, { ...product, quantity: 1 }];
            }

            return prevCart.map(item =>
                item.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item
            );
        });
    };

    // Function to remove item from cart
    const removeFromCart = (productId) => {
        setCartItems((prevCart) => prevCart.filter(item => item.productId !== productId));
    };

    // Function to update item quantity
    const updateQuantity = (productId, amount) => {
        setCartItems((prevCart) =>
            prevCart.map(item =>
                item.productId === productId ? { ...item, quantity: item.quantity + amount } : item
            ).filter(item => item.quantity > 0)
        );
    };

    // Function to clear the cart
    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;