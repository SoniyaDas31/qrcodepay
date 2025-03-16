import React, { useState, useEffect } from 'react';
import './App.css';
import qrIcon from './assets/qr-icon.png';

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
        ? 'https://qrcodepay.onrender.com/api/generate-qr'
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

  const handleShare = () => {
    const message = `Pay ₹${formData.amount} to ${formData.payeeName}\nUPI ID: ${formData.paymentAddress}\n${formData.description ? `Note: ${formData.description}\n` : ''}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
                  <button className="share-button" onClick={handleShare}>
                    <svg className="share-icon" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.958 17.887c-.11.18-.275.316-.473.41-.824.396-2.008.597-3.093.597-1.629 0-3.127-.406-4.454-1.159-1.557-.884-2.822-2.15-3.704-3.707-.882-1.563-1.317-3.074-1.317-4.527 0-1.085.201-2.269.597-3.093.094-.198.23-.364.41-.473.18-.11.379-.168.584-.168h1.337c.466 0 .88.32 1.001.784l.529 1.972c.079.295.02.61-.158.855l-.849 1.119c-.124.164-.142.393-.046.582.603 1.182 1.465 2.045 2.647 2.647.189.096.418.078.582-.046l1.119-.849c.245-.178.56-.237.855-.158l1.972.529c.464.121.784.535.784 1.001v1.337c0 .205-.058.404-.168.584z"/>
                    </svg>
                    Share on WhatsApp
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
