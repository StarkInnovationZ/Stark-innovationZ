const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5500; // Use Render's assigned port

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Path to the reviews JSON file
const reviewsFilePath = path.join(__dirname, 'reviews.json');

// Helper function to read reviews from the file
const readReviews = () => {
    try {
        if (!fs.existsSync(reviewsFilePath)) {
            fs.writeFileSync(reviewsFilePath, JSON.stringify([]));
        }
        const data = fs.readFileSync(reviewsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading reviews:", error);
        return [];
    }
};

// Helper function to write reviews to the file
const writeReviews = (reviews) => {
    try {
        fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));
    } catch (error) {
        console.error("Error writing reviews:", error);
    }
};

// API to get all reviews
app.get('/api/reviews', (req, res) => {
    res.json(readReviews());
});

// API to add a new review
app.post('/api/reviews', (req, res) => {
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

// API to delete a review by ID
app.delete('/api/reviews/:id', (req, res) => {
    const { id } = req.params;
    const reviews = readReviews();
    const updatedReviews = reviews.filter((review) => review.id !== parseInt(id));

    if (reviews.length === updatedReviews.length) {
        return res.status(404).json({ error: 'Review not found' });
    }

    writeReviews(updatedReviews);
    res.status(204).send();
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
