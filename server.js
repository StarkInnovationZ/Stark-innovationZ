const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 🔥 Load Firebase credentials from environment variable
if (!process.env.FIREBASE_CREDENTIALS) {
    console.error("❌ FIREBASE_CREDENTIALS is not set in environment variables!");
    process.exit(1); // Stop execution if credentials are missing
}

const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_CREDENTIALS, "base64").toString("utf8")
);

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://stark-innovationz-default-rtdb.asia-southeast1.firebasedatabase.app"
});

// ✅ Middleware: Verify Firebase Token
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
        console.error("🚫 Firebase Token Verification Failed:", error.message);
        return res.status(403).json({ error: "Unauthorized - Invalid token" });
    }
};

// 📌 Dummy Data for Reviews (Replace with DB later)
let reviews = [];

// 📌 Read Reviews
const readReviews = () => reviews;

// 📌 Write Reviews
const writeReviews = (data) => {
    reviews = data;
};

// ✅ API: Get All Reviews (Public)
app.get('/api/reviews', (req, res) => {
    res.json(readReviews());
});

// ✅ API: Add a Review (Authenticated Users Only)
app.post('/api/reviews', verifyToken, (req, res) => {
    const { name, stars, text } = req.body;
    if (!name || !stars || !text) {
        return res.status(400).json({ error: 'Name, stars, and text are required' });
    }

    const newReview = {
        id: Date.now(),
        name,
        stars,
        text,
        timestamp: new Date().toISOString(),
    };

    const updatedReviews = [...readReviews(), newReview];
    writeReviews(updatedReviews);

    res.status(201).json(newReview);
});

// ✅ API: Delete a Review (Authenticated Users Only)
app.delete('/api/reviews/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const reviewsList = readReviews();
    const updatedReviews = reviewsList.filter((review) => review.id !== parseInt(id));

    if (reviewsList.length === updatedReviews.length) {
        return res.status(404).json({ error: 'Review not found' });
    }

    writeReviews(updatedReviews);
    res.status(204).send();
});

// ✅ API: Health Check
app.get('/', (req, res) => {
    res.send("🔥 Stark InnovationZ Firebase API is Running!");
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
