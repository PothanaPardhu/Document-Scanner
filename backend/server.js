require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin (Note: FIREBASE_PRIVATE_KEY is usually structured differently depending on how it's passed)
// For now we try parsing if it's set, otherwise we skip to allow the app to run without it initially.
try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY !== "your-private-key") {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    console.log("Firebase Admin initialized.");
  } else {
    console.warn("Firebase Admin NOT initialized. Set FIREBASE credentials in .env");
  }
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const aiRoutes = require('./routes/ai');
const pdfRoutes = require('./routes/pdf');
const authRoutes = require('./routes/auth').router;

app.use('/api/ai', aiRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Focus-Flow AI Backend' });
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/focus-flow';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    // Start server anyway for routes that don't need DB
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (without DB)`));
  });
