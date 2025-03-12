const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./stark-innovationz-firebase-adminsdk-fbsvc-1125afc745.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://stark-innovationz-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Verify Firebase Token Middleware
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(403).json({ error: "Unauthorized - Invalid token" });
    }
};

// API to get all reviews (Public Access)
app.get('/api/reviews', (req, res) => {
    const reviews = readReviews();
    res.json(reviews);
});

// API to add a new review (Only Authenticated Users)
app.post('/api/reviews', verifyToken, (req, res) => {
    const { name, stars, text } = req.body;
    if (!name || !stars || !text) {
        return res.status(400).json({ error: 'Name, stars, and text are required' });
    }

    const reviews = readReviews();
    const newReview = {
        id: Date.now(),
        name,
        stars,
        text,
        timestamp: new Date().toISOString(),
    };
    reviews.push(newReview);
    writeReviews(reviews);

    res.status(201).json(newReview);
});

// API to delete a review (Only Authenticated Users)
app.delete('/api/reviews/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const reviews = readReviews();
    const updatedReviews = reviews.filter((review) => review.id !== parseInt(id));

    if (reviews.length === updatedReviews.length) {
        return res.status(404).json({ error: 'Review not found' });
    }

    writeReviews(updatedReviews);
    res.status(204).send();
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
