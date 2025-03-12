import React, { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    payeeName: '',
    paymentAddressType: 'UPI',
    paymentAddress: '',
    amount: '',
    description: ''
  });
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setQrCode(data.qrCode);
    } catch (error) {
      setError('Failed to generate QR code');
      console.error('Error:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="App">
      <h1>UPI QR Code Generator</h1>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Payee/Merchant Name:</label>
            <input
              type="text"
              name="payeeName"
              value={formData.payeeName}
              onChange={handleChange}
              required
              placeholder="Enter payee name"
            />
          </div>

          <div className="form-group">
            <label>Payment Address Type:</label>
            <select
              name="paymentAddressType"
              value={formData.paymentAddressType}
              onChange={handleChange}
            >
              <option value="UPI">UPI ID</option>
              <option value="BANK">Bank Account</option>
              <option value="MOBILE">Mobile Number</option>
            </select>
          </div>

          <div className="form-group">
            <label>Payment Address:</label>
            <input
              type="text"
              name="paymentAddress"
              value={formData.paymentAddress}
              onChange={handleChange}
              required
              placeholder="Enter UPI ID/Account/Mobile"
            />
          </div>

          <div className="form-group">
            <label>Amount (₹):</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Enter amount"
            />
          </div>

          <div className="form-group">
            <label>Description/Note:</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter payment description"
            />
          </div>

          <button type="submit">Generate QR Code</button>
        </form>

        <div className="qr-result">
          {error && <div className="error">{error}</div>}
          {qrCode && (
            <div className="qr-code">
              <h2>Scan QR Code</h2>
              <img src={qrCode} alt="UPI QR Code" />
              <p>Scan this QR code using any UPI-enabled payment app</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
