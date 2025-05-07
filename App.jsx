import React, { useState, useEffect } from 'react';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Receipt from './components/Receipt';
import OrderHistory from './components/OrderHistory'; // Import the new component

function App() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [receiptData, setReceiptData] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]); // State for history
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch menu and history from backend on initial load
  useEffect(() => {
    const fetchMenu = fetch('http://127.0.0.1:5000/api/menu').then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    });
    const fetchHistory = fetch('http://127.0.0.1:5000/api/history').then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    });

    Promise.all([fetchMenu, fetchHistory])
      .then(([menuData, historyData]) => {
        setMenu(menuData);
        setOrderHistory(historyData); // Set history state
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch initial data:", err);
        setError("Failed to load initial data. Please try again later.");
        setIsLoading(false);
      });
  }, []); // Empty dependency array means this runs once on mount

  // Add item to cart
  const handleAddToCart = (item) => {
    setCart(prevCart => ({
      ...prevCart,
      [item.name]: (prevCart[item.name] || 0) + 1
    }));
    setReceiptData(null); // Clear receipt if adding items after viewing one
  };

  // Update item quantity in cart
  const handleUpdateCartQuantity = (itemName, quantity) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      if (quantity <= 0) {
        delete newCart[itemName];
      } else {
        newCart[itemName] = quantity;
      }
      return newCart;
    });
     setReceiptData(null); // Clear receipt if modifying cart after viewing one
  };

   // Remove item from cart
  const handleRemoveFromCart = (itemName) => {
       setCart(prevCart => {
            const newCart = { ...prevCart };
            delete newCart[itemName];
            return newCart;
       });
       setReceiptData(null); // Clear receipt if modifying cart after viewing one
  };


  // Place the order
  const handlePlaceOrder = () => {
    // Convert cart object to array format expected by backend
    const orderItems = Object.entries(cart).map(([name, quantity]) => ({ name, quantity }));

    if (orderItems.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    fetch('http://127.0.0.1:5000/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderItems),
    })
      .then(response => {
        if (!response.ok) {
           // Try to read error message from backend
           return response.json().then(errData => {
                throw new Error(errData.message || `HTTP error! status: ${response.status}`);
           });
        }
        return response.json();
      })
      .then(data => {
        setReceiptData(data);
        // Add the newly placed order to the history state
        // Assuming the backend returns the full receipt data
        setOrderHistory(prevHistory => [data, ...prevHistory]); // Add new order to top

        // Optionally clear the cart after successful order
        // setCart({});
      })
      .catch(err => {
        console.error("Failed to place order:", err);
        alert(`Error placing order: ${err.message}`);
      });
  };

   // Start a new order
  const handleNewOrder = () => {
    setCart({}); // Clear the cart
    setReceiptData(null); // Clear the receipt
    // Note: History remains visible
  };


  return (
    <div className="app-container"> {/* Use a wrapper div */}
        <div className="container"> {/* Main container for menu/cart/receipt */}
          <h1>BCA Cafeteria</h1>

          <button class="settings"><a href="admin.html"><img src="setting.png" alt="" class="settings-pfp"></img></a></button>
          <img src="ITlogo2.png" alt="" class="logovec"/>

          {isLoading && <p className="loading">Loading...</p>}
          {error && <p className="error">{error}</p>}

          {!isLoading && !error && (
              receiptData ? (
                  <Receipt receiptData={receiptData} onNewOrder={handleNewOrder} />
              ) : (
                  <div className="menu-cart-container">
                    <Menu menu={menu} onAddToCart={handleAddToCart} />
                    <Cart
                        cart={cart}
                        menu={menu} // Pass menu to Cart to calculate totals
                        onUpdateQuantity={handleUpdateCartQuantity}
                        onRemoveItem={handleRemoveFromCart}
                        onPlaceOrder={handlePlaceOrder}
                    />
                  </div>
              )
          )}
        </div>
    </div>
  );
}

export default App;