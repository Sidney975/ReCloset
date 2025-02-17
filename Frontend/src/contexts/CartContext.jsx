import React, { createContext, useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls

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

    // 🔹 Function to fetch category name from API
    const fetchCategoryName = async (categoryId) => {
        try {
            const response = await axios.get(`/api/category/${categoryId}`); // Call Category API
            return response.data.name; // Extract category name
        } catch (error) {
            console.error("Failed to fetch category:", error);
            return "Unknown"; // Default if API call fails
        }
    };

    // 🔹 Function to add item to cart
    const addToCart = async (product) => {
        const categoryName = await fetchCategoryName(product.categoryId); // Fetch category name from API
    
        setCartItems((prevCart) => {
            const existingItem = prevCart.find(item => item.productId === product.productId);
    
            if (existingItem) {
                // If the item already exists, return the previous cart without modifying it
                return prevCart;
            }
    
            // If the item doesn't exist, add it to the cart
            return [
                ...prevCart, 
                {
                    productId: product.productId,  // Product ID (for lookup)
                    productName: product.name,  // Matches `OrderItem`
                    productCategory: categoryName,  // 🔹 Store actual category name
                    quantity: 1,  // Default quantity
                    itemPrice: product.price,  // Matches `ItemPrice` in `OrderItem`
                }
            ];
        });
    };

    // Function to remove item from cart
    const removeFromCart = (productId) => {
        setCartItems((prevCart) => prevCart.filter(item => item.productId !== productId));
    };

    // Function to update item quantity
    const updateQuantity = (productId, amount) => {
        setCartItems((prevCart) =>
            prevCart
                .map(item =>
                    item.productId === productId ? { ...item, quantity: item.quantity + amount } : item
                )
                .filter(item => item.quantity > 0)
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
