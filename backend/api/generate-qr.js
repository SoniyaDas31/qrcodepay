const express = require('express');
const cors = require('cors');
const qr = require('qrcode');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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