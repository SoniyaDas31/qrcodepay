const express = require('express');
const cors = require('cors');
const qr = require('qrcode');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

app.post('/api/generate-qr', async (req, res) => {
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

        // Construct UPI URL based on payment type
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
        res.json({ qrCode, upiUrl });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});