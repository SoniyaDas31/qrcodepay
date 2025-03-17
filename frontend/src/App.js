import React, { useState, useEffect } from 'react';
import './App.css';
// Remove unused import
// import qrIcon from './assets/qr-icon.png';

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
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Start loading
    try {
      const API_URL = process.env.NODE_ENV === 'production' 
        ? 'https://qrcodepay-backend.onrender.com/api/generate-qr'  // Updated production URL
        : 'http://localhost:5000/api/generate-qr';
      
      const response = await fetch(API_URL, {
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
      setShowModal(true);
    } catch (error) {
      setError('Failed to generate QR code');
      console.error('Error:', error);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Load saved data when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('paymentInfo');
    if (savedData) {
      const { payeeName, paymentAddressType, paymentAddress } = JSON.parse(savedData);
      setFormData(prev => ({
        ...prev,
        payeeName,
        paymentAddressType,
        paymentAddress
      }));
    }
  }, []);

  const handleSaveInfo = () => {
    const dataToSave = {
      payeeName: formData.payeeName,
      paymentAddressType: formData.paymentAddressType,
      paymentAddress: formData.paymentAddress
    };
    localStorage.setItem('paymentInfo', JSON.stringify(dataToSave));
  };

  // Remove handleShare function since it's not being used
  
  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const qrImage = new Image();
    const padding = 40; // Add padding value

    qrImage.onload = () => {
      // Set canvas size with padding on all sides
      canvas.width = qrImage.width + (padding * 2);
      canvas.height = qrImage.height + (padding * 2) + 100;

      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw QR code with padding
      ctx.drawImage(qrImage, padding, padding);

      // Set text properties
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';

      // Draw payment information with adjusted positioning
      const paymentInfo = [
        `Pay to: ${formData.payeeName}`,
        `Amount: ₹${formData.amount || 'Not specified'}`,
        `${formData.paymentAddressType}: ${formData.paymentAddress}`
      ];

      paymentInfo.forEach((text, index) => {
        ctx.fillText(text, canvas.width / 2, qrImage.height + padding + 30 + (index * 20));
      });

      // Convert canvas to image and download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `QR-${formData.payeeName}-${formData.amount || 'any'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    qrImage.src = qrCode;
  };

  return (
    <div className="App">
      <div className="app-header">
        {/* <img src={qrIcon} alt="Scan2Pay" className="app-logo" /> */}
        <h1>Scan2Pay UPI</h1>
      </div>
      <div className="container">
        <form className="qr-form" onSubmit={handleSubmit}>
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
              placeholder="Enter UPI ID / Mobile"
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

          <div className="button-group">
            <button type="submit">Generate QR Code</button>
            <button 
              type="button" 
              className="save-button" 
              onClick={handleSaveInfo}
              title="Save payment information"
            >
              <svg className="save-icon" viewBox="0 0 24 24">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              Save Info
            </button>
          </div>
        </form>

        {error && <div className="error">{error}</div>}
        
        {/* Modal */}
        {showModal && qrCode && (
          <>
            <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
            <div className="modal">
              <div className="modal-content">
                <h2>Scan QR Code</h2>
                {formData.amount && <div className="amount-text">₹{formData.amount}</div>}
                <img src={qrCode} alt="UPI QR Code" />
                <p className="upi-id">{formData.paymentAddress}</p>
                <p className="scan-text">Scan using any UPI payment apps</p>
                <div className="modal-buttons">
                  <button className="download-button" onClick={handleDownload}>
                    <svg className="download-icon" viewBox="0 0 24 24">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download QR
                  </button>
                  <button className="close-button" onClick={() => setShowModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {isLoading && (
        <div className="loader-overlay">
          <div className="loader-content">
            <div className="loader"></div>
            <p>QR code generation is in progress...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
