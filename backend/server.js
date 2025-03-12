require('dotenv').config();
const express = require('express');
const cors = require('cors');
const qr = require('qrcode');

const app = express();

app.use(cors());
app.use(express.json());

const generateQR = async (req, res) => {
    try {
        const {
            payeeName,
            paymentAddressType,
            paymentAddress,
            amount,
            description
        } = req.body;

        if (!payeeName || !paymentAddress) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let upiUrl;
        switch(paymentAddressType) {
            case 'UPI':
                upiUrl = `upi://pay?pa=${paymentAddress}`;
                break;
            case 'MOBILE':
                upiUrl = `upi://pay?pa=${paymentAddress}@upi`;
                break;
            case 'BANK':
                upiUrl = `upi://pay?pa=${paymentAddress}@bank`;
                break;
            default:
                upiUrl = `upi://pay?pa=${paymentAddress}`;
        }

        upiUrl += `&pn=${encodeURIComponent(payeeName)}`;
        if (amount) upiUrl += `&am=${amount}`;
        if (description) upiUrl += `&tn=${encodeURIComponent(description)}`;

        const qrCode = await qr.toDataURL(upiUrl);
        return res.json({ qrCode, upiUrl });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to generate QR code' });
    }
};

app.post('/api/generate-qr', generateQR);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;