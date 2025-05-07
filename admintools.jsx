import React, { useState, useEffect } from 'react';
import OrderHistory from './components/OrderHistory';

function Admintools() {
  const [orderHistory, setOrderHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formInput, setFormInput] = useState({ password: "" });
  const [formError, setFormError] = useState({ password: "" });
  const [showAdminTools, setShowAdminTools] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/history')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(historyData => {
        setOrderHistory(historyData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch initial data:", err);
        setError("Failed to load initial data. Please try again later.");
        setIsLoading(false);
      });
  }, []);

  const handleUserInput = (name, value) => {
    setFormInput({
      ...formInput,
      [name]: value,
    });
  };

  const validateFormInput = (event) => {
    event.preventDefault();

    let inputError = { password: "" };

    if (!formInput.password) {
      setFormError({ password: "Please enter the password." });
      return;
    }

    if (formInput.password !== "admin") {
      setFormError({ password: "Password is incorrect." });
      return;
    }

    // Password correct
    setFormError({ password: "" });
    setShowAdminTools(true);
  };

  return (
    <div className="app-container">
      <div className="container">
        <h1>BCA Cafeteria</h1>
        <button className="back-button">
          <a href="index.html"><img src="arrow-back-icon-sm.png" alt="Back" className="backButton-pfp" /></a>
        </button>
        <img src="ITlogo2.png" alt="" class="logovec"/>

        {!showAdminTools && (
          <div className="card">
            <div className="card-body">
              <form onSubmit={validateFormInput}>
                <input
                  value={formInput.password}
                  onChange={({ target }) => handleUserInput(target.name, target.value)}
                  name="password"
                  className="input"
                  placeholder="Enter Password"
                  type="password"
                />
                <p className="errorMessage">{formError.password}</p>
                <input type="submit" className="submitBtn" value="Submit" />
              </form>
            </div>
          </div>
        )}

        {showAdminTools && (
          <>
            {isLoading && <p className="loading">Loading...</p>}
            {error && <p className="error">{error}</p>}
            {!isLoading && !error && (
              <OrderHistory history={orderHistory} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Admintools;